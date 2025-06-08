import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Droplets, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutPage = () => {
  const teamMembers = [
    { name: "المهندس/ أحمد خالد", role: "المدير التنفيذي ومؤسس الشركة", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2VvfGVufDB8fDB8fHww&auto=format&fit=crop&w=300&q=60", description: "خبير في تقنيات معالجة المياه بخبرة تمتد لأكثر من 15 عامًا." },
    { name: "الدكتورة/ سارة علي", role: "رئيس قسم البحث والتطوير", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmVtYWxlJTIwc2NpZW50aXN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=300&q=60", description: "متخصصة في تطوير حلول مبتكرة لمعالجة المياه وتحليتها." },
    { name: "الأستاذ/ محمد حسن", role: "مدير التسويق والمبيعات", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWFuYWdlcnxlbnwwfHwwfHx8MA&auto=format&fit=crop&w=300&q=60", description: "يعمل على توسيع قاعدة عملاء الشركة وتقديم أفضل الخدمات." },
  ];

  const values = [
    { icon: <Droplets className="h-10 w-10 text-primary" />, title: "جودة لا تضاهى", description: "نلتزم بتقديم أعلى معايير الجودة في منتجاتنا وخدماتنا لضمان مياه نقية وصحية." },
    { icon: <ShieldCheck className="h-10 w-10 text-primary" />, title: "موثوقية وأمان", description: "حلولنا مصممة لتكون موثوقة وآمنة، مما يوفر راحة البال لعملائنا الكرام." },
    { icon: <Zap className="h-10 w-10 text-primary" />, title: "ابتكار مستمر", description: "نسعى دائمًا للابتكار وتطوير تقنيات جديدة لتلبية الاحتياجات المتغيرة لسوق معالجة المياه." },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          عن شركة رايت واتر
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          في رايت واتر، نؤمن بأن الحصول على مياه شرب نظيفة وآمنة هو حق أساسي للجميع. مهمتنا هي توفير حلول مبتكرة وموثوقة لمعالجة المياه، تساهم في تحسين جودة الحياة وحماية البيئة.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-16 grid md:grid-cols-2 gap-12 items-center"
      >
        <div>
          <img
            src="https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHdhdGVyJTIwdHJlYXRtZW50JTIwcGxhbnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=80"
            alt="محطة معالجة مياه حديثة تابعة لشركة رايت واتر"
            className="rounded-xl shadow-2xl w-full h-auto object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-primary flex items-center">
            <Target className="mr-3 h-10 w-10" /> رؤيتنا ورسالتنا
          </h2>
          <p className="text-lg text-foreground leading-relaxed">
            <strong>رؤيتنا:</strong> أن نكون الشركة الرائدة في مجال حلول معالجة المياه في مصر والشرق الأوسط، من خلال تقديم منتجات وخدمات مبتكرة تلبي أعلى معايير الجودة العالمية.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            <strong>رسالتنا:</strong> تمكين المجتمعات والأفراد من الوصول إلى مياه نقية وصحية عبر توفير تقنيات معالجة متطورة، مع الالتزام بالاستدامة البيئية والمسؤولية المجتمعية.
          </p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-4xl font-bold text-primary text-center mb-12 flex items-center justify-center">
          <Users className="mr-3 h-10 w-10" /> فريقنا المتميز
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index + 0.6 }}
            >
              <Card className="text-center glassmorphism-card h-full hover:shadow-xl transition-shadow">
                <CardHeader className="items-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-primary/50"
                  />
                  <CardTitle className="text-xl text-primary">{member.name}</CardTitle>
                  <p className="text-sm text-secondary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <h2 className="text-4xl font-bold text-primary text-center mb-12">قيمنا الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 * index + 0.9 }}
            >
              <Card className="text-center p-6 glassmorphism-card h-full hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-4">{value.icon}</div>
                <h3 className="text-2xl font-semibold text-primary mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-16 text-center"
      >
        <p className="text-lg text-foreground">
          نحن في رايت واتر، لا نقدم مجرد منتجات، بل نقدم حلولاً شاملة تضمن لكم ولأحبائكم مياهاً أكثر نقاءً وصحة.
        </p>
        <img  alt="مجموعة متنوعة من فلاتر المياه وأنظمة التحلية من رايت واتر" class="w-full max-w-4xl mx-auto mt-8 rounded-lg shadow-lg" src="https://images.unsplash.com/photo-1623990088169-3eafccdec2c0" />
      </motion.section>
    </div>
  );
};

export default AboutPage;