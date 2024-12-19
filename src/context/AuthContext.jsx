import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { tokenUtils } from '../utils/tokenUtils';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        const enhancedUser = {
          uid: user.uid,
          email: user.email,
          ...userData
        };

        setUser(enhancedUser);
        tokenUtils.setUser(enhancedUser);
      } else {
        setUser(null);
        tokenUtils.clearAll();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, additionalData = {}) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData = {
        email: firebaseUser.email,
        createdAt: new Date().toISOString(),
        role: 'customer',
        ...additionalData
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      const enhancedUser = {
        uid: firebaseUser.uid,
        ...userData
      };

      setUser(enhancedUser);
      tokenUtils.setUser(enhancedUser);
      
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();

      const enhancedUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...userData
      };

      setUser(enhancedUser);
      tokenUtils.setUser(enhancedUser);

      toast.success('Welcome back!');
      navigate(userData.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if first time
        const userData = {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: new Date().toISOString(),
          role: 'customer',
          provider: 'google'
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }

      const userData = userDoc.exists() ? userDoc.data() : {};
      const enhancedUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...userData
      };

      setUser(enhancedUser);
      tokenUtils.setUser(enhancedUser);

      toast.success('Logged in with Google successfully!');
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      tokenUtils.clearAll();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await firebaseUpdatePassword(user, newPassword);
      
      // Update user document with password change timestamp
      await setDoc(doc(db, 'users', user.uid), {
        lastPasswordChange: new Date().toISOString()
      }, { merge: true });

      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Update password error:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to update password');
      }
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    isAdmin: user?.role === 'admin',
    updatePassword,
  };

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