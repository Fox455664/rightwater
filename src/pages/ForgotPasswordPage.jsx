import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, KeyRound, ArrowRight, Loader2, Send } from 'lucide-react'; // Added Send here
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth has sendPasswordReset
import { useToast } from '@/components/ui/use-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { sendPasswordReset } = useAuth(); // Make sure this function exists in AuthContext
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!sendPasswordReset) {
        toast({
            title: "خطأ في الإعداد",
            description: "وظيفة استعادة كلمة المرور غير متاحة حالياً.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }

    try {
      await sendPasswordReset(email);
      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك (والبريد العشوائي).');
      toast({
        title: "✅ تم الإرسال بنجاح",
        description: "تفقد بريدك الإلكتروني لإعادة تعيين كلمة المرور.",
        className: "bg-green-500 text-white",
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      let friendlyMessage = "حدث خطأ أثناء محاولة إرسال بريد إعادة التعيين.";
      if (error.code === 'auth/user-not-found') {
        friendlyMessage = "لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = "البريد الإلكتروني الذي أدخلته غير صالح.";
      }
      setMessage(friendlyMessage);
      toast({
        title: "❌ خطأ في الإرسال",
        description: friendlyMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl glassmorphism-card overflow-hidden">
          <CardHeader className="text-center p-8 bg-primary/10">
            <KeyRound className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold text-primary">نسيت كلمة المرور؟</CardTitle>
            <CardDescription className="text-muted-foreground pt-2">
              لا تقلق! أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-foreground font-medium flex items-center">
                  <Mail className="ml-2 h-4 w-4 text-primary" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  required
                  className="mt-1 bg-background/70 border-primary/30 focus:border-primary text-lg p-3"
                />
              </div>
              
              {message && (
                <p className={`text-sm p-3 rounded-md ${message.includes('نجاح') || message.includes('تم إرسال') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </p>
              )}

              <Button type="submit" className="w-full text-lg py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="ml-2 h-5 w-5" />
                    إرسال رابط إعادة التعيين
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-8 bg-primary/5 text-center flex flex-col items-center">
            <p className="text-sm text-muted-foreground">
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </p>
            <Link to="/" className="mt-4 text-sm text-primary hover:underline flex items-center">
               العودة إلى الرئيسية <ArrowRight className="mr-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;