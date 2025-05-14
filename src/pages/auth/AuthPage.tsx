import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { sendLoginLink, isSignInWithEmailLink, completeLoginWithLink, auth } from '../../firebase'; // Corrected import name

interface AuthPageProps{
  onLogin: (type: 'parent' | 'teacher') => void;
}

function AuthPage({ onLogin }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'parent' | 'teacher'>('parent');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authMethod, setAuthMethod] = useState<'emailLink' | 'emailPassword'>('emailLink');
  const [step, setStep] = useState<'email' | 'otp'>('email');  

  useEffect(() => {
    const href = window.location.href;
    if (isSignInWithEmailLink(auth, href)) { // Corrected function call
      const savedEmail = window.localStorage.getItem('emailForSignIn');
      if (savedEmail) {
        setIsLoading(true);
        completeLoginWithLink(savedEmail, href)
          .then(() => {
            onLogin(userType);
            navigate('/');
          })
          .catch((error) => {
            setError(error.message || 'Une erreur est survenue');
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  }, [location, navigate, onLogin, userType]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email is required.');
    
    setIsLoading(true);
    setError('');
    
    try {
        if (authMethod === 'emailLink') {
            await sendLoginLink(email);
            setStep('otp');
            window.localStorage.setItem('emailForSignIn', email);
        } else {
          if (!password) {
              setError('Password is required.');
              setIsLoading(false);
              return;
          }
          
        if (isRegistering) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        
        onLogin(userType);
        navigate('/');
      }
    } catch (error: any) {
        console.error('Authentication error:', error);
        setError(error.message || 'An error occurred.');
    } finally {
      setIsLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-800 mb-2">SOSmaths</h1>
            <p className="text-secondary-dark-blue">
              {step === 'email' 
                ? 'Trouvez le professeur idéal même à la dernière minute !'
                : 'Vérifiez votre boîte mail pour le code de connexion'}
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex rounded-lg border border-gray-200 p-1">
              <button
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  authMethod === 'emailLink' ? 'bg-primary-100 text-primary-700' : 'text-secondary-dark-blue'
                }`}
                onClick={() => setAuthMethod('emailLink')}
              >
                Lien magique
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  authMethod === 'emailPassword' ? 'bg-primary-100 text-primary-700' : 'text-secondary-dark-blue'
                }`}
                onClick={() => setAuthMethod('emailPassword')}
              >
                Mot de passe
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {authMethod === 'emailPassword' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-dark-blue mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className='mt-2 text-center'>
                  <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                      {isRegistering ? 'Already have an account? Sign in' : 'No account? Sign up'}
                  </button>
              </div>
                
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary-dark-blue mb-1">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-3 rounded-lg border ${
                    userType === 'parent'
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-secondary-dark-blue'
                  }`}
                  onClick={() => setUserType('parent')}
                >
                  Parent
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-lg border ${
                    userType === 'teacher'
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 text-secondary-dark-blue'
                  }`}
                  onClick={() => setUserType('teacher')}
                >
                  Professeur
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-error-50 border border-error-200 p-4 text-error-700">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              fullWidth 
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <>
                  {authMethod === 'emailLink' ? (
                    step === 'email' ? (
                      <>
                        Continuer
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      'Vérifiez vos emails'
                    )
                  ) : (
                    <>
                      {isRegistering ? "S'inscrire" : "Se connecter"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </>
              )}
            </Button>            
          </form>
        </div>
      </div>
      
      <div className="p-4 text-center text-secondary-dark-blue text-sm">
        <p>© 2025 SOSmaths. Tous droits réservés.</p>
      </div>
    </div>
  );
}

export default AuthPage;