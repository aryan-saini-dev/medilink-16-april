import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { User, Activity, Upload } from "lucide-react";
import { PatientSharedContent, MOCK_PATIENT } from "@/components/PatientSharedContent";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const mockAuth = sessionStorage.getItem("patient_authenticated");
      const { data: { session } } = await supabase.auth.getSession();
      if (mockAuth === "true" || session) {
        if (session?.user?.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name);
        }
      } else {
        navigate("/patient-login");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    sessionStorage.removeItem("patient_authenticated");
    await supabase.auth.signOut();
    navigate("/patient-login");
  };

  const handleMockUpload = () => {
    if (!selectedFiles.length) {
      toast({ title: "No files selected", description: "Choose a file to upload (mock)." });
      return;
    }
    toast({
      title: "Upload queued (mock)",
      description: `${selectedFiles.length} document${selectedFiles.length === 1 ? "" : "s"} added to your record inbox.`,
    });
    setUploadOpen(false);
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <header className="h-14 flex items-center px-6 gap-4 z-20 shrink-0 bg-primary shadow-sm">
        <Link to="/" className="shrink-0"><Logo variant="white" size="md" /></Link>
        <span className="text-xs text-white/80 font-semibold uppercase tracking-wider border-l border-white/30 pl-4 leading-none">Patient Dashboard</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/15 hover:text-white" onClick={handleLogout}>Logout</Button>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto w-full pt-8 pb-16">
          <div className="px-6 mb-8">
            <Card className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-foreground">{userName || MOCK_PATIENT.name}</h1>
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-warning/10 text-warning border border-warning/20 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Risk: Moderate
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span>{MOCK_PATIENT.age} yrs</span>
                  <span>·</span>
                  <span>{MOCK_PATIENT.gender}</span>
                  <span>·</span>
                  <span>Blood: {MOCK_PATIENT.bloodType}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MOCK_PATIENT.allergies.map(a => (
                    <span key={a} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20 hidden sm:inline-block">
                      Allergy: {a}
                    </span>
                  ))}
                  {MOCK_PATIENT.chronic.map(c => (
                    <span key={c} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20 hidden sm:inline-block">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-auto flex md:flex-col gap-2 md:items-end">
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Upload className="w-4 h-4 mr-2" /> Upload documents
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload documents (mock)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Card className="p-3">
                        <p className="text-sm font-medium text-foreground mb-1">Add files to your record inbox</p>
                        <p className="text-xs text-muted-foreground">This is a UI mock only — nothing is stored yet.</p>
                      </Card>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select files</label>
                        <Input type="file" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))} />
                        {selectedFiles.length > 0 && <div className="text-xs text-muted-foreground">{selectedFiles.length} selected</div>}
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleMockUpload}>Add to inbox</Button>
                        <Button variant="outline" className="flex-1" onClick={() => setUploadOpen(false)}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
          <PatientSharedContent />
        </div>
      </main>
    </div>
  );
}
