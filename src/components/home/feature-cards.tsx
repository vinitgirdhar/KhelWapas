import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, CheckCircle, Zap } from "lucide-react";

const features = [
  {
    icon: <Truck className="h-8 w-8 text-primary" />,
    title: "Simple Selling",
    description: "Upload photos, describe your equipment, and submit your listing for review."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "More Value. More Play.",
    description: "Find equipment for your next game, with clear pricing and condition details."
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: "Reviewed Listings",
    description: "Listings are reviewed before they go live, with photos and condition grades to guide you."
  }
];

export default function FeatureCards() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Why Choose KHELWAPAS?</h2>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            We make buying and selling sports gear simpler, safer, and more sustainable.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="glass-container rounded-lg hover:shadow-2xl hover:-translate-y-2">
              <div className="glass-filter"></div>
              <div className="glass-overlay"></div>
              <div className="glass-specular"></div>
              <div className="glass-content">
                <Card className="text-center p-6 bg-transparent border-0 shadow-none w-full">
                  <CardHeader className="items-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl text-card-foreground">{feature.title}</CardTitle>
                    <CardDescription className="pt-2 text-card-foreground/80">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
