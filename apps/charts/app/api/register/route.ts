import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@potato/auth";
import { usersDb } from "@potato/database-users";
import { registerUserSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await usersDb.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await usersDb.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
    });

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle Zod validation errors
    if (error?.errors) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
