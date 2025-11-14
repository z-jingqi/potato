import { getChartsDatabase } from "@/lib/db";

export interface CreateCollectionInput {
  name: string;
  description?: string | null;
  icon?: string;
  dateDimensions?: "year" | "month" | "day" | "time";
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string | null;
  icon?: string;
  dateDimensions?: "year" | "month" | "day" | "time";
}

export class CollectionsService {
  /**
   * Get all collections for a user
   */
  static async getCollections(userId: string) {
    const db = getChartsDatabase();

    return db.collection.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: { records: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  /**
   * Get a single collection by ID
   * Throws error if not found or user doesn't have access
   */
  static async getCollectionById(id: string, userId: string) {
    const db = getChartsDatabase();

    const collection = await db.collection.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        records: {
          orderBy: {
            recordDate: "asc",
          },
        },
      },
    });

    if (!collection) {
      throw new Error("Collection not found");
    }

    return collection;
  }

  /**
   * Create a new collection
   */
  static async createCollection(
    userId: string,
    input: CreateCollectionInput
  ) {
    const db = getChartsDatabase();

    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Collection name is required");
    }

    return db.collection.create({
      data: {
        userId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        icon: input.icon || "📊",
        dateDimensions: input.dateDimensions || "day",
      },
    });
  }

  /**
   * Update an existing collection
   * Throws error if not found or user doesn't have access
   */
  static async updateCollection(
    id: string,
    userId: string,
    input: UpdateCollectionInput
  ) {
    const db = getChartsDatabase();

    // Verify ownership
    const existing = await db.collection.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Collection not found");
    }

    // Build update data
    const updateData: Partial<CreateCollectionInput> = {};

    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new Error("Collection name cannot be empty");
      }
      updateData.name = input.name.trim();
    }

    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }

    if (input.icon !== undefined) {
      updateData.icon = input.icon;
    }

    if (input.dateDimensions !== undefined) {
      updateData.dateDimensions = input.dateDimensions;
    }

    return db.collection.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a collection
   * Throws error if not found or user doesn't have access
   */
  static async deleteCollection(id: string, userId: string) {
    const db = getChartsDatabase();

    // Verify ownership
    const existing = await db.collection.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new Error("Collection not found");
    }

    // Delete collection (records will cascade delete)
    await db.collection.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Check if user owns a collection
   */
  static async verifyOwnership(id: string, userId: string): Promise<boolean> {
    const db = getChartsDatabase();

    const collection = await db.collection.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    return !!collection;
  }
}
