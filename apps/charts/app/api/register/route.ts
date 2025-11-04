import { NextRequest, NextResponse } from "next/server";
import { registerUser, registerSchema } from "@potato/auth";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Register user using shared function
    const user = await registerUser({
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }

    console.error("[POST /api/register] Error:", error);

    // Handle specific registration errors
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Registration failed, please try again" },
      { status: 500 }
    );
  }
}
