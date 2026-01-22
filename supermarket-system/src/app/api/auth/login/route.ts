import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../../../lib/auth';
import { UserModel } from '../../../../../models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt started');
    
    const body = await request.json();
    const { email, password } = body;

    console.log('📧 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    console.log('✅ Database connected');

    // Find user by email (case-insensitive)
    const user = await db
      .collection(UserModel.collectionName)
      .findOne({ email: email.toLowerCase().trim() });

    console.log('🔍 User lookup result:', user ? 'Found' : 'Not found');

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('👤 User found:', { 
      email: user.email, 
      role: user.role,
      hasPassword: !!user.password 
    });

    // Verify password
    console.log('🔑 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password);

    console.log('🔑 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    console.log('🎫 Token generated');

    // Create response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        _id: user._id.toString(),
      },
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('✅ Login successful for:', email);

    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}