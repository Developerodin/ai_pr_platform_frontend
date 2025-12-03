// src/components/ai-assistant/AIAssistantWidget.tsx
"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Send, 
  MessageCircle, 
  User, 
  Loader2, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  X, 
  Minus, 
  Plus,
  RotateCcw,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatbotApi } from '@/lib/api';
import { ChatMessage, ChatbotCompleteEvent, ApiError } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AIAssistantWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  contextualPrompts?: string[];
  className?: string;
}

export interface AIAssistantWidgetRef {
  sendMessage: (message: string) => void;
}

const AIAssistantWidget = forwardRef<AIAssistantWidgetRef, AIAssistantWidgetProps>(
  ({ isOpen, onToggle, contextualPrompts = [], className }, ref) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Enhanced scroll to bottom function
    const scrollToBottom = () => {
      // Method 1: Using messagesEndRef
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      // Method 2: Fallback using ScrollArea viewport
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }, 0);
        }
      }
    };

    // Load conversation from localStorage on mount
    useEffect(() => {
      try {
        const savedSession = localStorage.getItem('ai_chat_session_id');
        const savedMessages = localStorage.getItem('ai_chat_messages');
        
        if (savedSession) {
          setSessionId(savedSession);
        }
        
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
          // Scroll to bottom after loading messages
          setTimeout(() => scrollToBottom(), 100);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }, []);

    // Save conversation to localStorage whenever messages or sessionId changes
    useEffect(() => {
      if (sessionId) {
        localStorage.setItem('ai_chat_session_id', sessionId);
      }
    }, [sessionId]);

    useEffect(() => {
      if (messages.length > 0) {
        localStorage.setItem('ai_chat_messages', JSON.stringify(messages));
      }
    }, [messages]);

    // Expose sendMessage method to parent
    useImperativeHandle(ref, () => ({
      sendMessage: (message: string) => {
        handleSendMessage(message);
      }
    }));

    // Auto-scroll when messages change (including initial load)
    useEffect(() => {
      if (isOpen && !isMinimized) {
        scrollToBottom();
      }
    }, [messages, isOpen, isMinimized]);

    // Additional scroll after layout updates
    useLayoutEffect(() => {
      if (messages.length > 0 && isOpen && !isMinimized) {
        scrollToBottom();
      }
    }, [messages, isOpen, isMinimized]);

    // Focus input when chat opens
    useEffect(() => {
      if (isOpen && !isMinimized && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen, isMinimized]);

    // Clear unread count when chat opens
    useEffect(() => {
      if (isOpen) {
        setUnreadCount(0);
      }
    }, [isOpen]);

    // Build conversation context for API
    const buildConversationContext = () => {
      // Send last 10 messages as context to avoid token limits
      const recentMessages = messages.slice(-10);
      return recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
    };

    // Send message function with conversation context
    const handleSendMessage = async (message: string) => {
      if (!message.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      // Scroll after adding user message
      setTimeout(() => scrollToBottom(), 50);

      try {
        // Send conversation context along with the message
        const conversationContext = buildConversationContext();
        
        const response = await chatbotApi.sendMessage({
          message,
          session_id: sessionId,
          conversation_history: conversationContext,
        });

        const data: ChatbotCompleteEvent = response.data;
        
        // Update session ID if new
        if (data.session_id && !sessionId) {
          setSessionId(data.session_id);
        }

const assistantMessage: ChatMessage = {
  id: data.message.timestamp || Date.now().toString(),
  role: 'assistant',
  content: data.message.content,
  timestamp: data.message.timestamp || new Date().toISOString(),
  actions: data.actions_executed?.map(toolCall => ({
    type: toolCall.tool,
    status: 'completed',
    result: toolCall.args,
  })) ?? [],
  metadata: {
    suggestions: data.suggestions?.map(s => ({
      title: s.title,
      description: s.description,
      action: s.action,
      priority: (s.priority === 'high' || s.priority === 'medium' || s.priority === 'low') 
        ? s.priority 
        : 'medium' as 'high' | 'medium' | 'low',
    })) ?? [],
    next_steps: data.next_steps?.map(step => step.title) ?? [],
    // backend currently does not send tips/performance_info; keep optional
    tips: data.tips ?? [],
    credits_used: data.performance_info?.credits_used,
    quality_scores: data.performance_info?.quality_scores,
  },
};


        setMessages(prev => [...prev, assistantMessage]);

        // Scroll after adding assistant message
        setTimeout(() => scrollToBottom(), 100);

        // Increment unread count if chat is closed
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }

        // Show success toast for completed actions
const toolCount = data.actions_executed?.length ?? 0;
if (toolCount > 0) {
  toast.success(`✅ Ran ${toolCount} tool action${toolCount > 1 ? 's' : ''}`);
}


      } catch (error: unknown) {
        console.error('Error sending message:', error);
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.detail || 'Sorry, I encountered an error processing your request. Please try again.';
        
        const errorResponse: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, errorResponse]);
        setTimeout(() => scrollToBottom(), 50);
        toast.error('Failed to send message');
      } finally {
        setIsLoading(false);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(inputMessage);
      }
    };

    const handleSuggestionClick = (action: string) => {
      handleSendMessage(action);
    };

    const clearChat = () => {
      setMessages([]);
      setSessionId(null);
      setUnreadCount(0);
      
      // Clear localStorage
      localStorage.removeItem('ai_chat_session_id');
      localStorage.removeItem('ai_chat_messages');
      
      toast.success('Chat cleared');
      
      // Focus input after clearing
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    };

    // Floating chat button (when closed)
    if (!isOpen) {
      return (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={onToggle}
            className={cn(
              "relative h-16 w-16 rounded-full shadow-xl transition-all duration-300 hover:scale-110 group",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "border-2 border-primary/20"
            )}
            size="icon"
          >
            <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110" />
            
            {/* Unread badge */}
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center p-0 border-2 border-background animate-pulse"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            
            {/* Pulse animation for new messages */}
            {unreadCount > 0 && (
              <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
            )}
          </Button>
        </div>
      );
    }

    // Main chat widget (when open)
    return (
      <Card className={cn(
        "fixed bottom-6 right-6 w-[420px] z-40 shadow-2xl border transition-all duration-300 overflow-hidden",
        "bg-card text-card-foreground",
        isMinimized ? 'h-20' : 'h-[680px]',
        className
      )}>
        {/* Header - Fixed white space issue with proper padding */}
        <CardHeader className={cn(
          "bg-primary text-primary-foreground p-0 m-0 border-b",
          "bg-gradient-to-r from-primary via-primary to-primary/90"
        )}>
          <CardTitle className="flex items-center justify-between text-lg p-5 m-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <span className="font-semibold">PR Agent</span>
                {messages.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary-foreground/20 text-primary-foreground border-0">
                    {messages.length}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-9 w-9 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-9 w-9 p-0"
                onClick={onToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[620px] overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 overflow-hidden" ref={scrollAreaRef}>
              <div className="p-6 w-full space-y-6">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                        <Zap className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-xl mb-3 text-foreground">PR Agent is here to help you...</h3>
                    <p className="text-center mb-6 max-w-sm">I can help you streamline your workflow with intelligent automation and insights.</p>
                    
                    <div className="grid grid-cols-1 gap-3 w-full max-w-sm mb-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Generate PR pitches</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Manage journalists</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Send email campaigns</span>
                      </div>
                    </div>
                    
                    {/* Contextual Quick Actions */}
                    {contextualPrompts.length > 0 && (
                      <div className="w-full space-y-3 max-w-sm">
                        <p className="text-sm font-medium text-center text-foreground">Quick actions:</p>
                        {contextualPrompts.slice(0, 3).map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left h-auto p-3 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleSendMessage(prompt)}
                            title={prompt}
                          >
                            <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{prompt}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Messages */}
                {messages.map((message) => (
                  <div key={message.id} className="w-full">
                    <div className={`flex gap-4 w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[320px] rounded-2xl px-4 py-3 break-words",
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted text-muted-foreground'
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        {/* Action Results */}
{message.actions && message.actions.length > 0 && (
  <div className="mt-4 space-y-2">
    {message.actions.map((action, index: number) => (
      <div key={index} className="flex items-center gap-2 text-xs">
        <Badge
          variant="default"
          className="text-xs flex-shrink-0"
        >
          {(action.type || 'tool').replace(/_/g, ' ')}
        </Badge>
        <span className="truncate">
          ✅ executed
        </span>
      </div>
    ))}

    <div className="flex flex-wrap gap-3 text-xs mt-2">
      {message.metadata?.quality_scores &&
        message.metadata.quality_scores.length > 0 && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Quality: {message.metadata.quality_scores[0]}/10</span>
          </div>
        )}
      {message.metadata?.credits_used &&
        message.metadata.credits_used > 0 && (
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>Credits: {message.metadata.credits_used}</span>
          </div>
        )}
    </div>
  </div>
)}


                        {/* Interactive Suggestions */}
                        {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold flex items-center gap-1 mb-3">
                              <Sparkles className="h-3 w-3" />
                              Smart Suggestions:
                            </p>
                            <div className="space-y-2">
                              {message.metadata.suggestions.slice(0, 3).map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-left justify-start h-auto p-3 bg-background hover:bg-accent text-foreground border border-border/50"
                                  onClick={() => handleSuggestionClick(suggestion.action)}
                                >
                                  <div className="w-full text-left">
                                    <div className="font-medium text-xs mb-1">{suggestion.title}</div>
                                    <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Next Steps */}
{message.metadata?.next_steps && message.metadata.next_steps.length > 0 && (
  <div className="mt-4">
    <p className="text-xs font-semibold mb-2">Next Steps:</p>
    <ul className="text-xs space-y-1">
      {message.metadata.next_steps.slice(0, 2).map((step: string, index: number) => (
        <li key={index} className="flex items-start gap-2">
          <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
          <span>{step}</span>
        </li>
      ))}
    </ul>
  </div>
)}

                        {/* Tips */}
                        {message.metadata?.tips && message.metadata.tips.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Pro Tips:
                            </p>
                            <ul className="text-xs space-y-1">
                              {message.metadata.tips.slice(0, 2).map((tip, index) => (
                                <li key={index} className="text-muted-foreground">{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your PR campaigns..."
                    className="resize-none border-border/50 bg-background focus:border-primary transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick actions */}
              {messages.length > 0 && (
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear chat
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {messages.length} message{messages.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }
);

AIAssistantWidget.displayName = 'AIAssistantWidget';

export default AIAssistantWidget;
