// src/components/ai-assistant/AIAssistantPage.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  ArrowRight,
  TrendingUp,
  Zap,
  RotateCcw,
  MessageSquarePlus,
  Brain,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { chatbotApi } from "@/lib/api";
import { ChatMessage, ChatbotResponse } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const contextualPrompts = [
    "Generate a PR pitch for our latest product launch",
    "Analyze the performance of recent email campaigns",
    "Create a journalist outreach strategy for tech media",
    "Draft a press release template for partnerships",
  ];

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("ai_chat_session_id");
      const savedMessages = localStorage.getItem("ai_chat_messages");

      if (savedSession) {
        setSessionId(savedSession);
      }

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const buildConversationContext = () => {
    const recentMessages = messages.slice(-10);
    return recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const conversationContext = buildConversationContext();

      const response = await chatbotApi.sendMessage({
        message,
        session_id: sessionId,
        conversation_history: conversationContext,
      });

      const data: ChatbotResponse = response.data;

      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem("ai_chat_session_id", data.session_id);
      }

      const assistantMessage: ChatMessage = {
        id: data.message.timestamp || Date.now().toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: data.message.timestamp || new Date().toISOString(),
        actions: data.actions_executed ?? [],
        metadata: {
          suggestions: data.suggestions ?? [],
          next_steps: data.next_steps ?? [],
          tips: [],
          credits_used: undefined,
          quality_scores: undefined,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      localStorage.setItem(
        "ai_chat_messages",
        JSON.stringify([...messages, userMessage, assistantMessage])
      );

      const toolCount = data.actions_executed?.length ?? 0;
      if (toolCount > 0) {
        toast.success(
          `✅ Ran ${toolCount} tool action${toolCount > 1 ? "s" : ""}`
        );
      }
    } catch (error: any) {
      console.error("Error sending message:", error);

      const errorDetail =
        error.response?.data?.detail ||
        error.message ||
        "Sorry, I encountered an error processing your request. Please try again.";

      const errorText =
        typeof errorDetail === "string"
          ? errorDetail
          : JSON.stringify(errorDetail);

      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorResponse]);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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

    localStorage.removeItem("ai_chat_session_id");
    localStorage.removeItem("ai_chat_messages");

    toast.success("Chat cleared");

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">PR Agent</h1>
        <p className="text-muted-foreground">
          Your intelligent partner for PR campaigns, content creation, and
          workflow automation
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto mb-4"
        >
          <Card className="h-full shadow-none border-0 bg-transparent">
            <CardContent className="p-0">
              <div className="max-w-4xl mx-auto">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6 py-12">
                    <div className="relative mb-8">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-10 w-10 text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>

                    <h2 className="text-2xl font-semibold mb-4">
                      PR Agent is here to help you
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
                      I'm here to help you create compelling PR content,
                      analyze campaigns, and streamline your media outreach
                      workflow.
                    </p>

                    <div className="w-full max-w-2xl mb-8">
                      <p className="text-sm font-medium text-muted-foreground mb-4">
                        Try these quick actions:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {contextualPrompts.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="justify-start h-auto p-4 text-left hover:bg-muted transition-colors border border-border/50"
                            onClick={() => handleSendMessage(prompt)}
                          >
                            <div className="text-left w-full">
                              <div className="font-medium text-sm mb-1 line-clamp-1">
                                {prompt.split(" ").slice(0, 4).join(" ")}...
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {prompt}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="w-full max-w-2xl">
                      <p className="text-sm font-medium text-muted-foreground mb-4">
                        Or explore these features:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant="ghost"
                          className="justify-start h-auto p-4 text-left hover:bg-muted transition-colors border border-border/50 whitespace-normal"
                          onClick={() =>
                            handleSendMessage(
                              "Help me create compelling PR content for my latest announcement"
                            )
                          }
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center mb-1">
                              <ArrowRight className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <h3 className="font-medium text-sm">
                                Content Creation
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Generate PR pitches, press releases, and email
                              campaigns
                            </p>
                          </div>
                        </Button>

                        <Button
                          variant="ghost"
                          className="justify-start h-auto p-4 text-left hover:bg-muted transition-colors border border-border/50 whitespace-normal"
                          onClick={() =>
                            handleSendMessage(
                              "Analyze the performance of my recent PR campaigns and suggest improvements"
                            )
                          }
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center mb-1">
                              <ArrowRight className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <h3 className="font-medium text-sm">
                                Campaign Analysis
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Analyze performance metrics and optimize
                              strategies
                            </p>
                          </div>
                        </Button>

                        <Button
                          variant="ghost"
                          className="justify-start h-auto p-4 text-left hover:bg-muted transition-colors border border-border/50 whitespace-normal"
                          onClick={() =>
                            handleSendMessage(
                              "Help me find relevant journalists and publications for my industry"
                            )
                          }
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center mb-1">
                              <ArrowRight className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <h3 className="font-medium text-sm">
                                Media Research
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Find relevant journalists and publication
                              opportunities
                            </p>
                          </div>
                        </Button>

                        <Button
                          variant="ghost"
                          className="justify-start h-auto p-4 text-left hover:bg-muted transition-colors border border-border/50 whitespace-normal"
                          onClick={() =>
                            handleSendMessage(
                              "Show me how to automate my PR workflow and improve efficiency"
                            )
                          }
                        >
                          <div className="w-full text-left">
                            <div className="flex items-center mb-1">
                              <ArrowRight className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                              <h3 className="font-medium text-sm">
                                Workflow Automation
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Automate repetitive tasks and improve efficiency
                            </p>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="w-full py-4 max-w-xl">
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        Quick examples:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSendMessage(
                              "Write a press release for a product launch"
                            )
                          }
                          className="text-xs"
                        >
                          Product Launch PR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSendMessage(
                              "Create an email pitch for journalists"
                            )
                          }
                          className="text-xs"
                        >
                          Email Pitch
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSendMessage("Analyze my media coverage trends")
                          }
                          className="text-xs"
                        >
                          Coverage Analysis
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSendMessage(
                              "Find tech journalists in my area"
                            )
                          }
                          className="text-xs"
                        >
                          Find Journalists
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "w-full",
                      index !== messages.length - 1 &&
                        "border-b border-border/50",
                      message.role === "assistant"
                        ? "bg-muted/30"
                        : "bg-background"
                    )}
                  >
                    <div className="max-w-4xl mx-auto px-6 py-5">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              message.role === "assistant"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {message.role === "assistant" ? (
                              <Brain className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="space-y-4">
                            <div className="prose prose-sm max-w-none dark:prose-invert break-words">
                              <p className="leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere m-0">
                                {message.content}
                              </p>
                            </div>

                            {message.actions && message.actions.length > 0 && (
                              <div className="space-y-3 p-4 bg-background border rounded-lg">
                                <div className="text-sm font-medium">
                                  Actions Performed:
                                </div>
                                <div className="space-y-2">
                                  {message.actions.map(
                                    (action: any, actionIndex: number) => (
                                      <div
                                        key={actionIndex}
                                        className="flex items-center gap-3"
                                      >
                                        <Badge
                                          variant="default"
                                          className="text-xs"
                                        >
                                          {(
                                            action.tool || "tool"
                                          ).replace(/_/g, " ")}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          ✅ executed
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                                {(message.metadata?.quality_scores ||
                                  message.metadata?.credits_used) && (
                                  <div className="flex gap-4 text-sm pt-2 border-t">
                                    {message.metadata?.quality_scores &&
                                      message.metadata.quality_scores.length >
                                        0 && (
                                        <div className="flex items-center gap-1">
                                          <TrendingUp className="h-4 w-4 text-primary" />
                                          <span>
                                            Quality:{" "}
                                            {
                                              message.metadata
                                                .quality_scores[0]
                                            }
                                            /10
                                          </span>
                                        </div>
                                      )}
                                    {message.metadata?.credits_used &&
                                      message.metadata.credits_used > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Zap className="h-4 w-4 text-primary" />
                                          <span>
                                            Credits:{" "}
                                            {message.metadata.credits_used}
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            )}

                            {message.metadata?.suggestions &&
                              message.metadata.suggestions.length > 0 && (
                                <div className="space-y-3">
                                  <div className="text-sm font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Smart Suggestions:
                                  </div>
                                  <div className="grid gap-2">
                                    {message.metadata.suggestions
                                      .slice(0, 3)
                                      .map(
                                        (
                                          suggestion,
                                          suggestionIndex
                                        ) => (
                                          <Button
                                            key={suggestionIndex}
                                            variant="outline"
                                            className="w-full text-left justify-start h-auto p-4 hover:bg-primary hover:text-primary-foreground transition-colors"
                                            onClick={() =>
                                              handleSuggestionClick(
                                                suggestion.action
                                              )
                                            }
                                          >
                                            <div className="text-left w-full">
                                              <div className="font-medium text-sm mb-1">
                                                {suggestion.title}
                                              </div>
                                              <div className="text-xs opacity-70">
                                                {suggestion.description}
                                              </div>
                                            </div>
                                          </Button>
                                        )
                                      )}
                                  </div>
                                </div>
                              )}

                            {message.metadata?.next_steps &&
                              message.metadata.next_steps.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2">
                                    Next Steps:
                                  </div>
                                  <ul className="space-y-2">
                                    {message.metadata.next_steps
                                      .slice(0, 3)
                                      .map(
                                        (
                                          step: any,
                                          stepIndex: number
                                        ) => (
                                          <li
                                            key={stepIndex}
                                            className="flex items-start gap-2 text-sm"
                                          >
                                            <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                            <span>
                                              {step.icon
                                                ? `${step.icon} `
                                                : ""}
                                              {step.title}
                                              {step.description
                                                ? ` – ${step.description}`
                                                : ""}
                                            </span>
                                          </li>
                                        )
                                      )}
                                  </ul>
                                </div>
                              )}

                            {message.metadata?.tips &&
                              message.metadata.tips.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Pro Tips:
                                  </div>
                                  <ul className="space-y-1">
                                    {message.metadata.tips
                                      .slice(0, 2)
                                      .map((tip, tipIndex) => (
                                        <li
                                          key={tipIndex}
                                          className="text-sm text-muted-foreground"
                                        >
                                          {tip}
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}

                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2 mt-4 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(message.content)
                                  }
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="w-full bg-muted/30">
                    <div className="max-w-4xl mx-auto px-6 py-5">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Brain className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-t shadow-none">
          <CardContent className="p-1">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message PR Agent..."
                    className="h-12 text-base border-border/50 bg-background focus:border-primary transition-colors resize-none"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="h-12 w-12 bg-primary hover:bg-primary/90 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMessages([]);
                      setSessionId(null);
                      localStorage.removeItem("ai_chat_session_id");
                      localStorage.removeItem("ai_chat_messages");
                      setTimeout(() => {
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }, 100);
                    }}
                    className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
                  >
                    <MessageSquarePlus className="h-3 w-3 mr-1" />
                    New
                  </Button>
                </div>
                {messages.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {messages.length} message
                    {messages.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
