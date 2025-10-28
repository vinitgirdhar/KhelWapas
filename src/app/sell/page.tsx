'use client';

import PriceEstimator from "@/components/price-estimator";
import ManualSellForm from "@/components/sell/manual-sell-form";
import SellingPoints from "@/components/sell/selling-points";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, Mail, MessageSquare, PencilLine } from "lucide-react";

export default function SellPage() {
    const scrollToEstimator = () => {
        document.getElementById('price-estimator')?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <>
            <section className="bg-muted/20 text-center">
                <div className="container py-20 md:py-32">
                     <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                        Get an Instant AI Price Estimate for Your Gear
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Find out your gear’s value instantly and complete your sale in minutes.
                    </p>
                    <Button size="lg" className="mt-8 font-bold" onClick={scrollToEstimator}>
                        Start Now <ArrowDown className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </section>
            
            <SellingPoints />

            <div className="bg-background" id="price-estimator">
                <div className="container py-12 md:py-20">
                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        <div className="flex flex-col gap-6 lg:col-span-1">
                            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                                Describe Your Gear
                            </h2>
                            <p className="text-lg text-muted-foreground">
                               Fill out the details to get a real-time price estimate from our AI. The more accurate you are, the better the estimate.
                            </p>
                           
                            <div className="mt-4 p-6 bg-blue-100/50 border-l-4 border-primary rounded-r-lg">
                               <h4 className="font-headline font-semibold text-primary">How it works:</h4>
                               <ol className="list-decimal list-inside text-primary/80 mt-2 space-y-1">
                                   <li>Describe your gear below to get an estimate.</li>
                                   <li>Schedule a pickup at your convenience.</li>
                                   <li>Our team inspects and confirms the price on-site.</li>
                                   <li>Accept the offer and receive instant payment.</li>
                               </ol>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <PriceEstimator />
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-12" />

            <section className="container pb-20">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter">
                        Or, Submit a Manual Request
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Prefer to do it the old-fashioned way? Fill out the form below and our team will get back to you.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto">
                    <div className="glass-container rounded-lg">
                        <div className="glass-filter"></div>
                        <div className="glass-overlay"></div>
                        <div className="glass-specular"></div>
                        <div className="glass-content p-0">
                           <ManualSellForm />
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
}
