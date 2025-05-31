"use client"
import { resumeItems, certifications } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { motion } from "framer-motion"
import { Briefcase, Award, CalendarDays } from "lucide-react"

export default function ResumeSection() {
  return (
    <section id="resume" className="section-padding bg-secondary/50">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="heading-responsive font-bold text-center mb-12"
        >
          Resume Snapshot & Timeline
        </motion.h2>

        <div className="relative pl-6 after:absolute after:left-[calc(1.5rem_-_1px)] after:top-0 after:h-full after:w-0.5 after:bg-primary/30">
          {resumeItems.map((item, index) => (
            <motion.div
              key={index}
              className="mb-10 pl-8 relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="absolute left-[-10px] top-1.5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-primary">
                {item.logoUrl.startsWith("/placeholder.svg") ? (
                  <Briefcase className="h-6 w-6 text-primary" />
                ) : (
                  <Image
                    src={item.logoUrl || "/placeholder.svg"}
                    alt={`${item.company} logo`}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
              </div>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex-responsive justify-between sm:items-center mb-1">
                    <CardTitle className="text-xl font-semibold">{item.company}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center mt-1 sm:mt-0">
                      <CalendarDays className="mr-1.5 h-4 w-4" />
                      {item.duration}
                    </div>
                  </div>
                  <p className="text-md font-medium text-primary">{item.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: resumeItems.length * 0.2 }}
        >
          <h3 className="heading-responsive font-bold text-center mb-8">Certifications</h3>
          <div className="card-grid">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <Award className="h-6 w-6 text-primary mr-3" />
                      <p className="font-semibold text-md">{cert.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
