import { Contact } from "../models/contact.model";
import { AppDataSource } from "../config/database";
import { Repository, IsNull } from "typeorm";

export interface ContactResponse {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export class IdentityService {
  private contactRepository: Repository<Contact>;

  constructor() {
    this.contactRepository = AppDataSource.getRepository(Contact);
  }

  public async identifyContact(
    email?: string,
    phoneNumber?: string
  ): Promise<{ contact: ContactResponse }> {
    const matchingContacts = await this.findMatchingContacts(email, phoneNumber);

    if (matchingContacts.length === 0) {
      const newContact = await this.createPrimaryContact(email, phoneNumber);
      return this.formatResponse(newContact);
    }

    const primaryContact = this.findPrimaryContact(matchingContacts);
    const shouldCreateSecondary = await this.shouldCreateSecondaryContact(
      primaryContact,
      email,
      phoneNumber
    );

    if (shouldCreateSecondary) {
      await this.createSecondaryContact(primaryContact, email, phoneNumber);
    }

    await this.convertPrimariesToSecondaries(primaryContact, matchingContacts);
    const allLinkedContacts = await this.findAllLinkedContacts(primaryContact.id);

    return this.buildResponse(primaryContact, allLinkedContacts);
  }

  private async findMatchingContacts(
    email?: string,
    phoneNumber?: string
  ): Promise<Contact[]> {
    const query = this.contactRepository
      .createQueryBuilder("contact")
      .where("contact.deletedAt IS NULL");

    if (email && phoneNumber) {
      query.andWhere(
        "(contact.email = :email OR contact.phoneNumber = :phoneNumber)",
        { email, phoneNumber }
      );
    } else if (email) {
      query.andWhere("contact.email = :email", { email });
    } else if (phoneNumber) {
      query.andWhere("contact.phoneNumber = :phoneNumber", { phoneNumber });
    }

    return query.orderBy("contact.createdAt", "ASC").getMany();
  }

  private findPrimaryContact(contacts: Contact[]): Contact {
    // First, find all primary contacts
    const primaryContacts = contacts.filter((c) => c.linkPrecedence === "primary");
    
    if (primaryContacts.length > 0) {
      // Return the oldest primary contact
      return primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    }

    // If no primary contacts found, find by linkedId
    const linkedIds = contacts
      .map((c) => c.linkedId)
      .filter((id) => id !== null) as number[];
    
    if (linkedIds.length > 0) {
      const primaryId = Math.min(...linkedIds);
      // Try to find the primary contact by ID
      const foundPrimary = contacts.find((c) => c.id === primaryId);
      if (foundPrimary) {
        return foundPrimary;
      }
    }

    // Fallback: return the oldest contact
    return contacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  }

  private async shouldCreateSecondaryContact(
    primaryContact: Contact,
    email?: string,
    phoneNumber?: string
  ): Promise<boolean> {
    // Check if we have new email information
    const hasNewEmail = email && 
      email !== primaryContact.email && 
      !(await this.contactRepository.findOne({ 
        where: { email, deletedAt: IsNull() } 
      }));

    // Check if we have new phone information  
    const hasNewPhone = phoneNumber && 
      phoneNumber !== primaryContact.phoneNumber && 
      !(await this.contactRepository.findOne({ 
        where: { phoneNumber, deletedAt: IsNull() } 
      }));

    return Boolean(hasNewEmail || hasNewPhone);
  }

  private async createPrimaryContact(
    email?: string,
    phoneNumber?: string
  ): Promise<Contact> {
    const newContact = this.contactRepository.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkPrecedence: "primary",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.contactRepository.save(newContact);
  }

  private async createSecondaryContact(
    primaryContact: Contact,
    email?: string,
    phoneNumber?: string
  ): Promise<Contact> {
    const newContact = this.contactRepository.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.contactRepository.save(newContact);
  }

  private async convertPrimariesToSecondaries(
    primaryContact: Contact,
    matchingContacts: Contact[]
  ): Promise<void> {
    const otherPrimaries = matchingContacts.filter(
      (c) => c.linkPrecedence === "primary" && c.id !== primaryContact.id
    );

    for (const contact of otherPrimaries) {
      contact.linkPrecedence = "secondary";
      contact.linkedId = primaryContact.id;
      contact.updatedAt = new Date();
      await this.contactRepository.save(contact);

      // Update all contacts that were linked to this former primary
      await this.contactRepository.update(
        { linkedId: contact.id, deletedAt: IsNull() },
        { linkedId: primaryContact.id, updatedAt: new Date() }
      );
    }
  }

  private async findAllLinkedContacts(
    primaryContactId: number
  ): Promise<Contact[]> {
    return this.contactRepository
      .createQueryBuilder("contact")
      .where("contact.deletedAt IS NULL")
      .andWhere(
        "(contact.id = :id OR contact.linkedId = :id)",
        { id: primaryContactId }
      )
      .orderBy("contact.createdAt", "ASC")
      .getMany();
  }

  private buildResponse(
    primaryContact: Contact,
    allContacts: Contact[]
  ): { contact: ContactResponse } {
    const secondaryContacts = allContacts.filter(
      (c) => c.id !== primaryContact.id
    );

    // Build unique emails array with primary first
    const emails: string[] = [];
    if (primaryContact.email) {
      emails.push(primaryContact.email);
    }
    
    secondaryContacts.forEach(contact => {
      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }
    });

    // Build unique phone numbers array with primary first
    const phoneNumbers: string[] = [];
    if (primaryContact.phoneNumber) {
      phoneNumbers.push(primaryContact.phoneNumber);
    }
    
    secondaryContacts.forEach(contact => {
      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }
    });

    const secondaryContactIds = secondaryContacts
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id)
      .sort((a, b) => a - b); // Sort for consistent ordering

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }

  private formatResponse(contact: Contact): { contact: ContactResponse } {
    return {
      contact: {
        primaryContactId: contact.id,
        emails: contact.email ? [contact.email] : [],
        phoneNumbers: contact.phoneNumber ? [contact.phoneNumber] : [],
        secondaryContactIds: [],
      },
    };
  }
}