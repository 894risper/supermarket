import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/mongodb';
import { hashPassword, generateToken } from '../../../../../lib/auth';
import { UserModel, IUser } from '../../../../../models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Prepare user data
    const userData: Partial<IUser> = {
      name,
      email,
      password,
      role: 'customer',
      phone: phone || '',
    };

    // Sanitize input
    const sanitized = UserModel.sanitize(userData);

    // Validate input
    const validation = UserModel.validate(sanitized);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db
      .collection(UserModel.collectionName)
      .findOne({ email: sanitized.email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(sanitized.password!);

    // Create user
    const newUser: IUser = {
      name: sanitized.name!,
      email: sanitized.email!,
      password: hashedPassword,
      role: 'customer',
      phone: sanitized.phone || '',
      createdAt: new Date(),
    };

    const result = await db
      .collection(UserModel.collectionName)
      .insertOne(newUser);

    // Generate token
    const token = generateToken({
      id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      role: 'customer',
    });

    // Set cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: result.insertedId.toString(),
          name: newUser.name,
          email: newUser.email,
          role: 'customer',
        },
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}