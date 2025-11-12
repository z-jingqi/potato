import { getChartsDatabase } from "@/lib/db";
import { CollectionsService } from "./collections.service";

export interface CreateRecordInput {
  recordDate: string | Date;
  data: string;
}

export interface UpdateRecordInput {
  recordDate?: string | Date;
  data?: string;
}

export class RecordsService {
  /**
   * Create a new record in a collection
   * Verifies user owns the collection
   */
  static async createRecord(
    collectionId: string,
    userId: string,
    input: CreateRecordInput
  ) {
    const db = getChartsDatabase();

    // Verify user owns the collection
    const hasAccess = await CollectionsService.verifyOwnership(
      collectionId,
      userId
    );

    if (!hasAccess) {
      throw new Error("Collection not found");
    }

    // Validate input
    if (!input.recordDate) {
      throw new Error("Record date is required");
    }

    if (!input.data || input.data.trim().length === 0) {
      throw new Error("Data is required");
    }

    return db.record.create({
      data: {
        collectionId,
        recordDate: new Date(input.recordDate),
        data: typeof input.data === "string" ? input.data : JSON.stringify(input.data),
      },
    });
  }

  /**
   * Update an existing record
   * Verifies user owns the collection that contains the record
   */
  static async updateRecord(
    recordId: string,
    userId: string,
    input: UpdateRecordInput
  ) {
    const db = getChartsDatabase();

    // Get record with collection info
    const existingRecord = await db.record.findUnique({
      where: {
        id: recordId,
      },
      include: {
        collection: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingRecord) {
      throw new Error("Record not found");
    }

    // Verify ownership
    if (existingRecord.collection.userId !== userId) {
      throw new Error("Record not found");
    }

    // Build update data
    const updateData: {
      recordDate?: Date;
      data?: string;
    } = {};

    if (input.recordDate !== undefined) {
      updateData.recordDate = new Date(input.recordDate);
    }

    if (input.data !== undefined) {
      if (input.data.trim().length === 0) {
        throw new Error("Data cannot be empty");
      }
      updateData.data =
        typeof input.data === "string" ? input.data : JSON.stringify(input.data);
    }

    return db.record.update({
      where: { id: recordId },
      data: updateData,
    });
  }

  /**
   * Delete a record
   * Verifies user owns the collection that contains the record
   */
  static async deleteRecord(recordId: string, userId: string) {
    const db = getChartsDatabase();

    // Get record with collection info
    const existingRecord = await db.record.findUnique({
      where: {
        id: recordId,
      },
      include: {
        collection: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingRecord) {
      throw new Error("Record not found");
    }

    // Verify ownership
    if (existingRecord.collection.userId !== userId) {
      throw new Error("Record not found");
    }

    await db.record.delete({
      where: { id: recordId },
    });

    return { success: true };
  }

  /**
   * Get all records for a collection
   * Verifies user owns the collection
   */
  static async getRecordsByCollection(collectionId: string, userId: string) {
    const db = getChartsDatabase();

    // Verify ownership
    const hasAccess = await CollectionsService.verifyOwnership(
      collectionId,
      userId
    );

    if (!hasAccess) {
      throw new Error("Collection not found");
    }

    return db.record.findMany({
      where: {
        collectionId,
      },
      orderBy: {
        recordDate: "asc",
      },
    });
  }

  /**
   * Create multiple records at once
   * Verifies user owns the collection
   */
  static async createManyRecords(
    collectionId: string,
    userId: string,
    records: CreateRecordInput[]
  ) {
    const db = getChartsDatabase();

    // Verify user owns the collection
    const hasAccess = await CollectionsService.verifyOwnership(
      collectionId,
      userId
    );

    if (!hasAccess) {
      throw new Error("Collection not found");
    }

    // Validate all records
    for (const record of records) {
      if (!record.recordDate) {
        throw new Error("All records must have a date");
      }
      if (!record.data || record.data.trim().length === 0) {
        throw new Error("All records must have data");
      }
    }

    // Create all records
    const createdRecords = await db.record.createMany({
      data: records.map((record) => ({
        collectionId,
        recordDate: new Date(record.recordDate),
        data: typeof record.data === "string" ? record.data : JSON.stringify(record.data),
      })),
    });

    return createdRecords;
  }
}
