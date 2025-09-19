import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  fullName: string;
  role?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the current user from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if the current user is an employee
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'employee') {
      throw new Error('Access denied. Only employees can create users.');
    }

    const { email, fullName, role = 'user' }: CreateUserRequest = await req.json();

    if (!email || !fullName) {
      throw new Error('Email and full name are required');
    }

    // Generate a temporary password
    const tempPassword = crypto.randomUUID().slice(0, 12);

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      user_metadata: {
        full_name: fullName,
        role: role,
      },
      email_confirm: false // Skip email confirmation for admin-created users
    });

    if (createError) {
      throw createError;
    }

    console.log('User created successfully:', newUser.user?.id);

    // Send welcome email with temporary password
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const emailResponse = await resend.emails.send({
      from: 'StudyAbroad System <onboarding@resend.dev>',
      to: [email],
      subject: 'Welcome to StudyAbroad System - Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to StudyAbroad System!</h1>
          
          <p>Hello ${fullName},</p>
          
          <p>An account has been created for you in the StudyAbroad System. You can now log in using the credentials below:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e0e0e0; padding: 2px 4px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong> Please change your password after your first login for security reasons.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com')}/auth" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">
            If you have any questions, please contact your system administrator.
          </p>
        </div>
      `,
    });

    console.log('Welcome email sent:', emailResponse);

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: newUser.user?.id,
        email: newUser.user?.email,
        fullName: fullName,
        role: role
      },
      message: 'User created successfully and welcome email sent'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create user',
        success: false 
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);