import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserAuthForm from './user-auth-form';
import { User } from '@shared/schema';

interface AuthModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  setUser: (user: User) => void;
}

export default function AuthModal({ showModal, setShowModal, setUser }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>('login');

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-poppins text-primary text-center">
            {activeTab === 'login' ? 'Login to Your Account' : 'Create an Account'}
          </DialogTitle>
          <p className="text-center text-gray-600 mt-1">
            {activeTab === 'login' 
              ? 'Welcome back! Please enter your details.' 
              : 'Join us to start playing and winning!'}
          </p>
        </DialogHeader>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <UserAuthForm 
              formType="login" 
              onSuccess={(user) => {
                setUser(user);
                setShowModal(false);
              }} 
            />
          </TabsContent>
          
          <TabsContent value="register">
            <UserAuthForm 
              formType="register" 
              onSuccess={(user) => {
                setUser(user);
                setShowModal(false);
              }} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
