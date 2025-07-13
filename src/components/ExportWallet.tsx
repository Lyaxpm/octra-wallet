
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportWallet } from '@/utils/octraWallet';
import { Download, ArrowLeft, Copy, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExportWallet = () => {
  const [exportData, setExportData] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const handleExport = (format: 'privatekey' | 'wallet') => {
    try {
      const data = exportWallet(format);
      setExportData(prev => ({ ...prev, [format]: data }));
      
      toast({
        title: "Export Successful",
        description: `Wallet ${format} exported successfully`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (data: string, type: string) => {
    navigator.clipboard.writeText(data);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`
    });
  };

  const downloadFile = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${filename} has been downloaded`
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Security Warning */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Security Warning:</strong> Never share your private key with anyone. 
          Anyone with access to your private key can control your wallet and funds.
          Store this information securely and offline.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet">Full Wallet Export</TabsTrigger>
          <TabsTrigger value="privatekey">Private Key Only</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Complete Wallet Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Export your complete wallet information including address, private key, and RPC endpoint.
                This format is useful for wallet backups or importing into other applications.
              </p>

              <Button 
                onClick={() => handleExport('wallet')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Wallet Export
              </Button>

              {exportData.wallet && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Wallet Data (JSON)</Label>
                    <Textarea
                      value={exportData.wallet}
                      readOnly
                      rows={8}
                      className="font-mono text-xs bg-gray-50"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(exportData.wallet, 'Wallet data')}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => downloadFile(exportData.wallet, 'octra-wallet-backup.json')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privatekey">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Private Key Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>DANGER:</strong> Your private key grants full access to your wallet. 
                  Keep it secret and secure. Never share it online or store it in plain text.
                </AlertDescription>
              </Alert>

              <p className="text-muted-foreground">
                Export only your private key. This is useful for importing your wallet into other applications
                that only require the private key.
              </p>

              <Button 
                onClick={() => handleExport('privatekey')}
                variant="destructive"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Private Key
              </Button>

              {exportData.privatekey && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Private Key (Hex)</Label>
                    <Textarea
                      value={exportData.privatekey}
                      readOnly
                      rows={3}
                      className="font-mono text-xs bg-red-50 border-red-200"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(exportData.privatekey, 'Private key')}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => downloadFile(exportData.privatekey, 'octra-private-key.txt')}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Store your backup in multiple secure, offline locations</li>
            <li>• Never share your private key or backup file with anyone</li>
            <li>• Use encrypted storage for digital backups</li>
            <li>• Consider using a hardware wallet for large amounts</li>
            <li>• Regularly test your backup by importing it in a test environment</li>
            <li>• Keep your backup secure from physical access</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportWallet;
