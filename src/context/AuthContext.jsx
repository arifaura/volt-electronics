import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import Loader from '../components/utils/Loader';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data()
            });
          } else {
            // If no user document exists, create one
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              role: 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        toast.error('Authentication error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          ...userDoc.data()
        };

        // Check if trying to access admin login with non-admin account
        if (isAdminLogin && userData.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.');
        }

        setUser(userData);
        toast.success('Successfully logged in!');
        
        // Redirect based on login type and role
        if (isAdminLogin) {
          if (userData.role === 'admin') {
            navigate('/admin/dashboard');  // Navigate to admin dashboard
          } else {
            throw new Error('Access denied. Admin privileges required.');
          }
        } else {
          // Regular login
          if (userData.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }
      }

      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signup = async (userData) => {
    try {
      const { email, password, ...otherData } = userData;
      
      // First create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Then create the user document in Firestore
      const userDocData = {
        ...otherData,
        email,
        role: otherData.role || 'customer',
        createdAt: new Date().toISOString(),
        uid: userCredential.user.uid
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userDocData);

      // Update local state
      setUser({
        uid: userCredential.user.uid,
        ...userDocData
      });

      // Show success message and navigate based on role
      toast.success('Account created successfully!');
      
      // Navigate based on user role
      if (userDocData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Successfully logged out!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        const userData = {
          name: user.displayName,
          email: user.email,
          role: 'customer',
          createdAt: new Date().toISOString(),
          photoURL: user.photoURL || null,
          phoneNumber: user.phoneNumber || null,
          uid: user.uid
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        
        setUser({
          uid: user.uid,
          ...userData
        });
      } else {
        setUser({
          uid: user.uid,
          ...userDoc.data()
        });
      }

      toast.success('Successfully signed in with Google!');
      navigate('/');
      return true;
    } catch (error) {
      console.error('Google sign in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups for this site';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with the same email address but different sign-in credentials';
          break;
        default:
          errorMessage = error.code ? error.code.replace(/auth|\/|-/g, ' ').trim() : 'Failed to sign in with Google';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    login,
    signup,
    logout,
    signInWithGoogle,
    isAdmin
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext; 