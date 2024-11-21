import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const db = getFirestore();

export const updateUserRole = async (uid, isAdmin) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      isAdmin: isAdmin
    });
    console.log('User role updated successfully');
  } catch (error) {
    console.error('Error updating user role:', error);
  }
}; 