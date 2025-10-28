
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Mic, Send, X, Loader2 } from 'lucide-react';
import { KhelwapasLogo } from '../icons/khelwapas-logo';
import { cn } from '@/lib/utils';
import { chatWithKhelbot } from '@/ai/flows/khelbot-chat';
import { ScrollArea } from '../ui/scroll-area';
import type * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from '@/hooks/use-toast';


type Message = {
    role: 'user' | 'model';
    content: string;
};

type HistoryItem = {
    role: 'user' | 'model';
    content: { text: string }[];
}

export default function KhelbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const viewportRef = useRef<React.ElementRef<typeof ScrollAreaPrimitive.Viewport>>(null);
    const { toast } = useToast();

    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{ role: 'model', content: "Hi! I'm KhelBot. How can I help you today? You can ask me about selling, buying, or tracking your order." }]);
        }
    }, [isOpen, messages.length]);

     useEffect(() => {
        // Auto-scroll to the bottom when new messages are added
        if (viewportRef.current) {
            viewportRef.current.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim()) return;
        
        const userMessage: Message = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // We need to format the history for the Genkit flow
            const historyForApi: HistoryItem[] = [...messages, userMessage].map(msg => ({
                role: msg.role,
                content: [{ text: msg.content }]
            }));

            const response = await chatWithKhelbot({
                message: textToSend,
                history: historyForApi.slice(0, -1) // Pass history without the current message
            });
            const modelMessage: Message = { role: 'model', content: response };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("KhelBot Error:", error);
            const errorMessage: Message = { role: 'model', content: "Sorry, I'm having a little trouble right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleMicClick = () => {
        toast({
            title: "Voice Input Coming Soon!",
            description: "We're working on adding voice capabilities to KhelBot.",
        });
    };

    return (
        <TooltipProvider>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                {isOpen && (
                    <div
                        className={cn(
                            "w-[380px] h-[600px] transition-all duration-300 origin-bottom-right mb-4 scale-100 opacity-100"
                        )}
                    >
                        <div className="glass-container w-full h-full rounded-lg">
                            <div className="glass-filter"></div>
                            <div className="glass-overlay"></div>
                            <div className="glass-specular"></div>
                            <div className="glass-content h-full">
                               <Card className="w-full h-full bg-transparent border-0 shadow-none flex flex-col p-0">
                                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/20 bg-black/50">
                                        <div className="flex items-center gap-3">
                                            <KhelwapasLogo className="w-10 h-10" />
                                            <div>
                                                <h3 className="font-headline font-semibold text-white">KhelBot</h3>
                                                <p className="text-xs text-white/80">AI Support</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 hover:text-white">
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                                        <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
                                            <div className="space-y-4">
                                                {messages.map((message, index) => (
                                                    <div key={index} className={cn(
                                                        "flex gap-3 items-end",
                                                        message.role === 'user' ? "justify-end" : "justify-start"
                                                    )}>
                                                        {message.role === 'model' && (
                                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                                <AvatarFallback className="bg-primary text-primary-foreground">K</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                        <div className={cn(
                                                            "rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap shadow",
                                                            message.role === 'user'
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-background text-foreground"
                                                        )}>
                                                            {message.content}
                                                        </div>
                                                        {message.role === 'user' && (
                                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                                <AvatarFallback className="bg-secondary text-secondary-foreground">U</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                ))}
                                                {loading && (
                                                    <div className="flex gap-3 items-end justify-start">
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-primary text-primary-foreground">K</AvatarFallback>
                                                        </Avatar>
                                                        <div className="rounded-lg px-4 py-2 bg-background">
                                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                        <div className="p-4 border-t border-white/20">
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                                                <Button variant="secondary" size="sm" className="text-xs" onClick={() => handleSend("Help me with selling")}>Sell Help</Button>
                                                <Button variant="secondary" size="sm" className="text-xs" onClick={() => handleSend("How do I track my order?")}>Track Order</Button>
                                                <Button variant="secondary" size="sm" className="text-xs" onClick={() => handleSend("Questions about payment")}>Payments</Button>
                                                <Button variant="secondary" size="sm" className="text-xs" onClick={() => handleSend("I need to report an issue")}>Report Issue</Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="secondary" size="icon" onClick={handleMicClick}>
                                                    <Mic className="h-5 w-5" />
                                                </Button>
                                                <Input
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                                    placeholder="Ask a question..."
                                                    disabled={loading}
                                                    className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground"
                                                />
                                                <Button onClick={() => handleSend()} disabled={loading || !input.trim()}>
                                                    <Send className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                 <div className={cn("transition-opacity duration-300", isOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                className="rounded-full w-16 h-16 shadow-lg bg-primary hover:bg-primary/90"
                                onClick={() => setIsOpen(true)}
                                aria-label="Open KhelBot"
                                suppressHydrationWarning
                            >
                                <MessageSquare className="h-8 w-8" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Need help? Ask KhelBot!</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );

    
}
