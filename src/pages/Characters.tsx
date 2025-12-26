import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Character, CharacterApplication, CharacterAssignment } from "@/types/characters";
import { supabase } from "@/integrations/supabase/client";
import { CharacterCard } from "@/components/CharacterCard";
import { ApplyCharacterDialog } from "@/components/ApplyCharacterDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ShieldAlert, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Characters() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [applications, setApplications] = useState<CharacterApplication[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<CharacterAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [charsRes, appsRes, assignsRes] = await Promise.all([
        supabase.from('characters').select('*').order('tier', { ascending: false }),
        supabase.from('character_applications').select('*, profiles(display_name, avatar_url)').order('created_at', { ascending: false }),
        supabase.from('character_assignments').select('*, profiles(display_name, avatar_url), characters(*)').eq('status', 'ACTIVE')
      ]);

      if (charsRes.error) throw charsRes.error;
      if (appsRes.error) throw appsRes.error;
      if (assignsRes.error) throw assignsRes.error;

      setCharacters(charsRes.data || []);
      setApplications(appsRes.data as any || []);
      setActiveAssignments(assignsRes.data as any || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch character data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (character: Character) => {
    setSelectedCharacter(character);
    setIsApplyDialogOpen(true);
  };

  const handleVote = async (applicationId: string, voteType: 'SUPPORT' | 'OPPOSE') => {
    if (!user) {
      toast.error("Please log in to vote.");
      return;
    }

    try {
      const { error } = await supabase
        .from('character_application_votes')
        .insert({
          application_id: applicationId,
          user_id: user.id,
          vote_type: voteType
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You have already voted on this application.");
        } else {
          throw error;
        }
      } else {
        toast.success(`Voted ${voteType.toLowerCase()} successfully!`);
        fetchData(); // Refresh to show updated counts
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to vote");
    }
  };

  return (
    <>
      <Helmet>
        <title>Character Roles | Gokuldham Society</title>
        <description>Become an iconic member of Gokuldham Society. Merit-based roles for active residents.</description>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container py-8 max-w-7xl mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Character Role System</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Iconic society members are represented by residents for limited terms, based on trust, participation, and community approval.
            </p>
          </div>

          <Tabs defaultValue="available" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="available">Available Roles</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="active">Active Members</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="available">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-muted rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map((char) => (
                    <CharacterCard 
                      key={char.id} 
                      character={char} 
                      onApply={handleApply} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-4 mb-6">
                  <Info className="text-primary mt-1 shrink-0" size={20} />
                  <p className="text-sm">
                    Applications are open for 48-72 hours. During this time, residents can support or oppose candidates. Selection is based on community feedback, trust score, and reputation.
                  </p>
                </div>

                {applications.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                      <p className="text-muted-foreground">No active applications at the moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  applications.map((app) => (
                    <Card key={app.id} className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {app.profiles?.avatar_url ? (
                            <img src={app.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : <Users size={24} className="text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{app.profiles?.display_name || "Resident"}</CardTitle>
                            <Badge variant="outline">Applying for {characters.find(c => c.id === app.character_id)?.name}</Badge>
                          </div>
                          <CardDescription>Applied {new Date(app.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-600">{app.support_count}</div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Support</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-red-600">{app.oppose_count}</div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Oppose</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="italic text-muted-foreground bg-muted/30 p-4 rounded-lg border border-dashed">
                          "{app.statement}"
                        </p>
                      </CardContent>
                      <div className="flex border-t divide-x">
                        <Button 
                          variant="ghost" 
                          className="flex-1 rounded-none hover:bg-green-50 hover:text-green-700 h-12"
                          onClick={() => handleVote(app.id, 'SUPPORT')}
                        >
                          Support Candidate
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex-1 rounded-none hover:bg-red-50 hover:text-red-700 h-12"
                          onClick={() => handleVote(app.id, 'OPPOSE')}
                        >
                          Oppose Candidate
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAssignments.length === 0 ? (
                  <div className="col-span-full text-center py-20 opacity-50">
                    <ShieldAlert size={64} className="mx-auto mb-4" />
                    <p className="text-xl">No characters are currently active.</p>
                    <p className="text-sm text-muted-foreground mt-2">Check the available roles to apply!</p>
                  </div>
                ) : (
                  activeAssignments.map((assign) => (
                    <Card key={assign.id} className="overflow-hidden border-primary/20 bg-primary/5">
                      <div className="h-40 bg-muted relative">
                        {assign.characters?.image_url ? (
                          <img src={assign.characters.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30">
                            <Star size={48} className="text-primary/60" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-primary">Active</Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{assign.characters?.name}</CardTitle>
                        <CardDescription>Represented by {assign.profiles?.display_name}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tenure Ends:</span>
                            <span className="font-medium">{new Date(assign.end_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Performance Score:</span>
                            <span className={`font-bold ${assign.performance_score > 70 ? 'text-green-600' : 'text-orange-600'}`}>
                              {assign.performance_score}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${assign.performance_score > 70 ? 'bg-green-500' : 'bg-orange-500'}`} 
                            style={{ width: `${assign.performance_score}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
        
        <ApplyCharacterDialog 
          character={selectedCharacter}
          isOpen={isApplyDialogOpen}
          onClose={() => setIsApplyDialogOpen(false)}
          onSuccess={fetchData}
          userId={user?.id}
        />
      </div>
    </>
  );
}
