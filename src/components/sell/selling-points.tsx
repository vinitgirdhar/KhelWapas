import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, CheckCircle, Zap } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Instant AI Pricing",
    description: "Get a fair and accurate price for your gear in seconds with our AI-powered tool."
  },
  {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: "Free Doorstep Pickup",
    description: "Schedule a pickup, and we'll collect your used gear from your home, hassle-free."
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: "Secure & Fast Payment",
    description: "Our team grades your gear on-site. Accept the offer and get paid instantly."
  }
];

export default function SellingPoints() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">A Smarter Way to Sell</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            We make selling your used sports equipment simple, transparent, and rewarding.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
             <Card key={index} className="text-center p-6 bg-transparent border-0 shadow-none w-full group">
                <CardHeader className="items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                    {feature.icon}
                </div>
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                <CardDescription className="pt-2">{feature.description}</CardDescription>
                </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
