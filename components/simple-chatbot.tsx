"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, User, Send, MessageCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Predefined responses for simple chatbot
const responses = {
  greeting: "Hello! I'm Sakthiish's AI assistant. How can I help you learn more about his work?",
  projects:
    "Sakthiish has worked on several exciting projects including TUNE (an AI fine-tuning platform), a Calorie Tracker AI App, a Debt Repayment App, and SailPoint automation tools.",
  skills:
    "Sakthiish's skills include Python, Java, JavaScript, SailPoint IIQ, Next.js, AI/ML (fine-tuning, RAG systems, LLM Ops), and more.",
  experience:
    "Sakthiish has 6+ years of experience, currently working at Deloitte as a Risk Advisory Consultant. He's also an ex-startup founder and is building TUNE, an AI fine-tuning platform for SMEs.",
  contact:
    "You can connect with Sakthiish via LinkedIn or email through the contact section at the bottom of this page.",
  default:
    "I'm a simple demo chatbot. For more detailed information, please contact Sakthiish directly or check out the relevant sections on this portfolio.",
}

// Simple message type
type Message = {
  id: number
  content: string
  sender: "user" | "bot"
}

export default function SimpleChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content: input,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now(),
        content: getBotResponse(input),
        sender: "bot",
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return responses.greeting
    } else if (lowerInput.includes("project") || lowerInput.includes("work") || lowerInput.includes("portfolio")) {
      return responses.projects
    } else if (lowerInput.includes("skill") || lowerInput.includes("know") || lowerInput.includes("tech")) {
      return responses.skills
    } else if (lowerInput.includes("experience") || lowerInput.includes("background") || lowerInput.includes("work")) {
      return responses.experience
    } else if (lowerInput.includes("contact") || lowerInput.includes("email") || lowerInput.includes("reach")) {
      return responses.contact
    } else {
      return responses.default
    }
  }

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-40 w-80 md:w-96"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" />
                  Ask about Sakthiish
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Hi! I'm a simple demo assistant. Ask me about Sakthiish's projects or skills!
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 w-full pr-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        Start a conversation! Try asking about Sakthiish's projects or skills.
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-2 max-w-[80%] ${
                            message.sender === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {message.sender === "user" ? (
                              <User className="h-6 w-6 text-primary" />
                            ) : (
                              <Bot className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                              message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex gap-2">
                          <Bot className="h-6 w-6 text-primary" />
                          <div className="bg-secondary rounded-lg px-3 py-2 text-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about Sakthiish..."
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
