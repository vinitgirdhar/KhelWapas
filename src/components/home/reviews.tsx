
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "../ui/badge";
import { useEffect, useRef, useState } from "react";

const reviews = [
  {
    name: "Rohan Sharma",
    role: "Cricketer",
    avatar: "/images/products/background.jpg",
    dataAiHint: "indian man",
    testimonial: "Selling my old bat was so easy with Khelwapas. The pickup was on time, and I got the money in my account before the agent even left. Fantastic service!"
  },
  {
    name: "Priya Singh",
    role: "Football Parent",
    avatar: "/images/products/background.jpg",
    dataAiHint: "indian woman",
    testimonial: "I bought a pair of 'Excellent' grade football boots for my son. They looked almost new! The quality check is a game-changer. Will definitely buy again."
  },
  {
    name: "Ankit Desai",
    role: "Badminton Player",
    avatar: "/images/products/background.jpg",
    dataAiHint: "man playing badminton",
    testimonial: "Found a high-end racket that I could never afford new. The 'Refurbished' tag was accurate, and it plays like a dream. This is the future of sports shopping."
  },
   {
    name: "Aisha Khan",
    role: "Hockey Player",
    avatar: "/images/products/background.jpg",
    dataAiHint: "woman playing hockey",
    testimonial: "The process was seamless. Listed my old hockey stick, it got picked up the next day, and the payment was instant. Highly recommend for any athlete."
  },
  {
    name: "Vikram Mehta",
    role: "Runner",
    avatar: "/images/products/background.jpg",
    dataAiHint: "running shoes",
    testimonial: "Got a great deal on a pair of lightly used premium running shoes. The condition was exactly as described. Khelwapas is my new go-to for gear."
  },
  {
    name: "Sunita Reddy",
    role: "Basketball Parent",
    avatar: "/images/products/background.jpg",
    dataAiHint: "basketball",
    testimonial: "My daughter needed new basketball shoes. Found a great pair here for half the price of new ones. The 'Inspected' badge gave me peace of mind."
  }
];

export default function Reviews() {
  const [api, setApi] = useState<CarouselApi>();
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  const startScrolling = (direction: 'next' | 'prev') => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);
    scrollInterval.current = setInterval(() => {
      if (direction === 'next') {
        api?.scrollNext();
      } else {
        api?.scrollPrev();
      }
    }, 2000); // scrolls every 2 seconds
  };

  const stopScrolling = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }
  };

  useEffect(() => {
    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-foreground">Trusted by Athletes & Parents</h2>
          <p className="text-lg text-foreground/80 mt-2 max-w-2xl mx-auto">
            Hear from our community of buyers and sellers.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
            <Badge variant="outline" className="text-lg py-2 px-4 border-support bg-support/10 text-green-700 border-green-500">1000+ Items Sold</Badge>
            <Badge variant="outline" className="text-lg py-2 px-4 border-primary bg-primary/10 text-primary">Verified Sellers</Badge>
            <Badge variant="outline" className="text-lg py-2 px-4 border-accent bg-accent/10 text-accent">Quality Inspected</Badge>
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-4 h-full">
                  <Card className="h-full flex flex-col">
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                      <Avatar className="w-20 h-20 mb-4">
                        <AvatarImage src={review.avatar} alt={review.name} data-ai-hint={review.dataAiHint} />
                        <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-lg font-medium text-foreground">{review.name}</p>
                      <p className="text-sm text-foreground/60 mb-4">{review.role}</p>
                      <blockquote className="text-foreground/80 italic">
                        "{review.testimonial}"
                      </blockquote>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div 
            onMouseEnter={() => startScrolling('prev')}
            onMouseLeave={stopScrolling}
          >
            <CarouselPrevious />
          </div>
          <div
            onMouseEnter={() => startScrolling('next')}
            onMouseLeave={stopScrolling}
          >
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
