'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { 
  login, 
  register, 
  type LoginActionState, 
  type RegisterActionState 
} from '@/app/(auth)/actions';

const AuthModal = () => {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const loginInitialState: LoginActionState = {
    status: 'idle'
  };

  const registerInitialState: RegisterActionState = {
    status: 'idle'
  };

  const [loginState, loginAction] = useActionState<LoginActionState, FormData>(
    login,
    loginInitialState
  );

  const [registerState, registerAction] = useActionState<RegisterActionState, FormData>(
    register,
    registerInitialState
  );

  const isLoading = 
    loginState.status === 'in_progress' || 
    registerState.status === 'in_progress';

  useEffect(() => {
    const status = mode === 'login' ? loginState.status : registerState.status;
    
    if (status === 'failed') {
      toast.error(mode === 'login' ? 'Invalid credentials!' : 'Failed to create account');
    } else if (status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (status === 'user_exists') {
      toast.error('Account already exists');
    } else if (status === 'success') {
      if (mode === 'register') {
        toast.success('Account created successfully');
      }
      setIsSuccessful(true);
      router.refresh();
    }
  }, [loginState.status, registerState.status, mode, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    if (mode === 'login') {
      loginAction(formData);
    } else {
      registerAction(formData);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setIsSuccessful(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
        <h3 className="text-xl font-semibold dark:text-zinc-50">
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {mode === 'login'
            ? 'Use your email and password to sign in'
            : 'Create an account with your email and password'}
        </p>
      </div>

      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton 
          isSuccessful={isSuccessful}
        >
          {mode === 'login' ? 'Sign in' : 'Sign up'}
        </SubmitButton>

        <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
            disabled={isLoading}
            className="font-semibold text-gray-800 hover:underline dark:text-zinc-200 disabled:opacity-50 disabled:no-underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
          {mode === 'login' ? ' for free.' : ' instead.'}
        </p>
      </AuthForm>
    </>
  );
};

export default AuthModal;