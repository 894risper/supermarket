import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/mongodb';
import { verifyPassword, generateToken } from '../../../../../lib/auth';
import { User } from '../../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login attempt for:', email);
    console.log('📧 Email received:', JSON.stringify(email));
    console.log('🔑 Password length:', password?.length);

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    console.log('✅ Database connected');

    // Find user with detailed logging
    const user = await db.collection<User>('users').findOne({ email: email.trim().toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      
      // Debug: List all users in database
      const allUsers = await db.collection('users')
        .find({}, { projection: { email: 1, name: 1, role: 1 } })
        .toArray();
      console.log('📋 All users in database:', allUsers);
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ User found:', { 
      id: user._id, 
      email: user.email, 
      name: user.name,
      role: user.role,
      hasPassword: !!user.password 
    });

    // Verify password with logging
    console.log('🔍 Verifying password...');
    const isValidPassword = await verifyPassword(password, user.password);
    console.log('🔑 Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

    // Generate token
    const token = generateToken({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    console.log('✅ Token generated');

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log('✅ Login successful for:', email);

    return response;
  } catch (error) {
    console.error('💥 Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}