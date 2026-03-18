import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { mockIntegrations, mockSyncLogs } from "@/data/mockIntegrations";
import { RefreshCw, CheckCircle, XCircle, Clock, Link2, Settings, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminIntegrations = () => {
  const [integrations] = useState(mockIntegrations);
  const [syncLogs] = useState(mockSyncLogs);

  const handleSync = (integrationName: string) => {
    toast({
      title: "Manual Sync Initiated",
      description: `Syncing data with ${integrationName}...`,
    });
  };

  const handleConfigure = (integrationName: string) => {
    toast({
      title: "Configuration",
      description: `Opening settings for ${integrationName}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-600">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const columns = [
    {
      header: "Integration",
      accessor: "integrationName"
    },
    {
      header: "Timestamp",
      accessor: (row: any) => formatTimestamp(row.timestamp)
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge variant={
          row.status === "success" ? "default" :
          row.status === "partial" ? "outline" :
          "destructive"
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Records",
      accessor: "recordsProcessed"
    },
    {
      header: "Message",
      accessor: "message"
    }
  ];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <PageHeader title="Integration Management" subtitle="Manage LearnDash LMS integration for training management" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Active Integrations" value={`${integrations.filter(i => i.status === 'connected').length}/${integrations.length}`} />
          <StatCard title="Total Syncs Today" value={syncLogs.filter(log => log.timestamp.startsWith('2024-10-08')).length} />
          <StatCard title="Success Rate" value={`${Math.round((syncLogs.filter(l => l.status === 'success').length / syncLogs.length) * 100)}%`} />
        </div>

        <div className="space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Link2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    {getStatusBadge(integration.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      {integration.type === 'webhook' ? 'Webhook URL' : 'API Endpoint'}
                    </label>
                    <Input 
                      value={integration.endpoint || ''} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Last Sync
                    </label>
                    <Input 
                      value={integration.lastSync ? formatTimestamp(integration.lastSync) : 'Never'} 
                      readOnly 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <Activity className="w-4 h-4 inline mr-1" />
                    {integration.syncCount} total syncs
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfigure(integration.name)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSync(integration.name)}
                      disabled={integration.status === 'disconnected'}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sync Activity Log</CardTitle>
            <CardDescription>Recent synchronization events across all integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={syncLogs} itemsPerPage={10} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminIntegrations;
