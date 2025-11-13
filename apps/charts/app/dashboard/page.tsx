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
import { BarChart3, MessageSquare, FileText, Plus, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { CollectionsService } from '@/lib/services';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's collections using the service layer
  const collections = await CollectionsService.getCollections(session.user.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur-md">
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
                <Link href="/dashboard/collections/new">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    New Chart
                  </Button>
                </Link>
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

          {/* Charts List */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>My Charts</CardTitle>
                    <CardDescription>Your charts and data visualizations</CardDescription>
                  </div>
                  <Link href="/dashboard/collections/new">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Chart
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {collections.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No charts yet</p>
                    <p className="text-sm mb-4">
                      Create your first chart to start tracking data
                    </p>
                    <Link href="/dashboard/collections/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Chart
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.map((collection) => (
                      <Card key={collection.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="text-3xl flex-shrink-0">
                                {collection.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">
                                  {collection.name}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                  {collection._count.records} {collection._count.records === 1 ? 'record' : 'records'}
                                </CardDescription>
                              </div>
                            </div>
                            <Link
                              href={`/dashboard/collections/${collection.id}/edit`}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </div>
                          {collection.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {collection.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Link href={`/dashboard/collections/${collection.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                View Data
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
