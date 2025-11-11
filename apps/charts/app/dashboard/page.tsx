import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@potato/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@potato/ui/components/card';
import { BarChart3, MessageSquare, FileText } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥔</span>
              <h1 className="text-xl font-bold">Potato Charts</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium">{session.user.name}</span>
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Create beautiful charts and get AI-powered insights
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Create Chart</CardTitle>
                <CardDescription>
                  Start creating a new chart with your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">New Chart</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Ask AI to analyze your chart data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Ask AI
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>My Charts</CardTitle>
                <CardDescription>
                  View and manage your existing charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View All
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🤖</span> AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your app is configured to use OpenRouter for AI capabilities.
                The AI can help you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Analyze chart data and identify trends</li>
                <li>Suggest the best visualization types</li>
                <li>Generate insights and recommendations</li>
                <li>Answer questions about your data</li>
              </ul>
            </CardContent>
          </Card>

          {/* Empty State for Charts */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Charts</CardTitle>
                <CardDescription>Your recently created charts will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No charts yet</p>
                  <p className="text-sm mb-4">
                    Create your first chart to get started
                  </p>
                  <Button>Create Your First Chart</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
