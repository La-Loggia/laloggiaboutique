import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error('Error al registrarse', { description: error.message });
      } else {
        toast.success('Cuenta creada correctamente');
        navigate('/admin');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Error al iniciar sesión', { description: error.message });
      } else {
        toast.success('Sesión iniciada');
        navigate('/admin');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-wide text-foreground">LA LOGGIA</h1>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
            Panel de Administración
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-secondary border-border"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            {isLoading ? 'Procesando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Primera vez? Crear cuenta'}
          </button>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al catálogo
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
