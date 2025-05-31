import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIDemoWidgetProps {
  className?: string
}

const DEMO_PROMPTS = [
  {
    title: 'Code Analysis',
    description: 'Analyze this React component and suggest improvements',
    prompt: 'Can you analyze this React component and suggest ways to improve its performance and maintainability?'
  },
  {
    title: 'Documentation',
    description: 'Generate documentation for this function',
    prompt: 'Please generate comprehensive documentation for this function, including parameters, return type, and examples.'
  },
  {
    title: 'Bug Fix',
    description: 'Help me debug this error',
    prompt: 'I\'m getting this error in my code. Can you help me understand what\'s causing it and how to fix it?'
  }
]

export function AIDemoWidget({ className }: AIDemoWidgetProps) {
  const [selectedTab, setSelectedTab] = useState('code')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string>('')

  const handleDemoClick = async (prompt: string) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResponse('This is a demo response. In the actual implementation, this would be the AI assistant\'s response to your query.')
    } catch (error) {
      console.error('Error getting AI response:', error)
      setResponse('Sorry, there was an error getting the response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Assistant Demo
        </CardTitle>
        <CardDescription>
          Try out the AI assistant with these example prompts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code">Code Analysis</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="debug">Debugging</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Example Code</h4>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                {`function ExampleComponent({ data }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    data.forEach(item => {
      setState(item);
    });
  }, [data]);
  
  return <div>{state}</div>;
}`}
              </pre>
            </div>
            <Button
              onClick={() => handleDemoClick(DEMO_PROMPTS[0].prompt)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Code
                </>
              )}
            </Button>
          </TabsContent>
          <TabsContent value="docs" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Example Function</h4>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                {`function calculateTotal(items, taxRate) {
  const subtotal = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  return subtotal + tax;
}`}
              </pre>
            </div>
            <Button
              onClick={() => handleDemoClick(DEMO_PROMPTS[1].prompt)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Documentation
                </>
              )}
            </Button>
          </TabsContent>
          <TabsContent value="debug" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Example Error</h4>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                {`TypeError: Cannot read property 'map' of undefined
    at UserList (UserList.js:12:23)
    at render (App.js:45:67)`}
              </pre>
            </div>
            <Button
              onClick={() => handleDemoClick(DEMO_PROMPTS[2].prompt)}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Error...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Debug Error
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
        {response && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">AI Response</h4>
            <p className="text-sm">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 