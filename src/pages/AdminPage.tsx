import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Search, Copy, Eye, Edit, MapPin, AlertTriangle, LogOut, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Form states
  const [newShipment, setNewShipment] = useState({
    sender_name: '',
    sender_address: '',
    sender_country: '',
    sender_email: '',
    receiver_name: '',
    receiver_address: '',
    receiver_country: '',
    receiver_email: '',
    origin: '',
    destination: '',
    weight: '',
    shipping_fee: '',
    package_description: '',
    package_value: '',
    currency: 'USD',
    days_of_package: ''
  });

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

  useEffect(() => {
    // Check if already authenticated, redirect to login if not
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth !== 'true') {
      navigate('/admin-login');
      return;
    }
    fetchShipments();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    navigate('/admin-login');
  };

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to fetch shipments');
    }
  };

  const generateTrackingId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SPD${timestamp}${random}`;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images (JPEG, PNG, GIF) and videos (MP4, WebM, OGG) are allowed');
      return;
    }

    setMediaFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const uploadMediaFile = async (file: File, trackingId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${trackingId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('shipment-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('shipment-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  };

  const createShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const trackingId = generateTrackingId();
      
      let mediaUrl = null;
      let mediaType = null;
      
      // Upload media file if provided
      if (mediaFile) {
        mediaUrl = await uploadMediaFile(mediaFile, trackingId);
        mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
        
        if (!mediaUrl) {
          toast.error('Failed to upload media file');
          setIsLoading(false);
          return;
        }
      }
      
      const shipmentData = {
        tracking_id: trackingId,
        ...newShipment,
        weight: newShipment.weight ? parseFloat(newShipment.weight) : null,
        shipping_fee: newShipment.shipping_fee ? parseFloat(newShipment.shipping_fee) : null,
        package_value: parseFloat(newShipment.package_value),
        days_of_package: newShipment.days_of_package ? parseInt(newShipment.days_of_package) : null,
        media_url: mediaUrl,
        media_type: mediaType,
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert([shipmentData])
        .select()
        .single();

      if (error) throw error;

      // Create initial event
      await supabase
        .from('shipment_events')
        .insert([{
          shipment_id: data.id,
          status: 'Created',
          note: 'Shipment created and ready for pickup',
          location: newShipment.origin,
          occurred_at: new Date().toISOString()
        }]);

      const shareUrl = `${window.location.origin}/track/${trackingId}`;
      
      toast.success(
        <div>
          <p>Shipment created successfully!</p>
          <p className="font-mono text-sm">{trackingId}</p>
        </div>
      );

      // Reset form
      setNewShipment({
        sender_name: '',
        sender_address: '',
        sender_country: '',
        sender_email: '',
        receiver_name: '',
        receiver_address: '',
        receiver_country: '',
        receiver_email: '',
        origin: '',
        destination: '',
        weight: '',
        shipping_fee: '',
        package_description: '',
        package_value: '',
        currency: 'USD',
        days_of_package: ''
      });
      
      // Reset media
      setMediaFile(null);
      setMediaPreview(null);

      fetchShipments();

      // Show share URL
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Tracking link copied to clipboard!');
      });

    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment');
    } finally {
      setIsLoading(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: string, note?: string) => {
    try {
      // Update shipment status
      await supabase
        .from('shipments')
        .update({ 
          current_status: status,
          last_scan_at: new Date().toISOString()
        })
        .eq('id', shipmentId);

      // Add new event
      await supabase
        .from('shipment_events')
        .insert([{
          shipment_id: shipmentId,
          status,
          note: note || `Status updated to ${status}`,
          occurred_at: new Date().toISOString()
        }]);

      toast.success('Status updated successfully');
      fetchShipments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const toggleCustomsHold = async (shipmentId: string, currentHold: boolean) => {
    try {
      await supabase
        .from('shipments')
        .update({ is_customs_held: !currentHold })
        .eq('id', shipmentId);

      const status = !currentHold ? 'Customs Hold' : 'Customs Cleared';
      
      await supabase
        .from('shipment_events')
        .insert([{
          shipment_id: shipmentId,
          status,
          note: !currentHold 
            ? 'Package held by customs for inspection'
            : 'Package cleared customs and ready for delivery',
          occurred_at: new Date().toISOString()
        }]);

      toast.success(`Customs hold ${!currentHold ? 'applied' : 'removed'}`);
      fetchShipments();
    } catch (error) {
      console.error('Error toggling customs hold:', error);
      toast.error('Failed to update customs status');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">SwiftPath Admin Panel</h1>
            <p className="text-muted-foreground">Manage shipments and tracking</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Eye className="mr-2 w-4 h-4" />
              View Site
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Shipment</TabsTrigger>
            <TabsTrigger value="manage">Manage Shipments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Create Shipment Tab */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 w-5 h-5" />
                  Create New Shipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createShipment} className="space-y-6">
                  {/* Sender Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Sender Information</h3>
                      <div>
                        <Label htmlFor="sender_name">Sender Name *</Label>
                        <Input
                          id="sender_name"
                          value={newShipment.sender_name}
                          onChange={(e) => setNewShipment({...newShipment, sender_name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sender_address">Sender Address *</Label>
                        <Textarea
                          id="sender_address"
                          value={newShipment.sender_address}
                          onChange={(e) => setNewShipment({...newShipment, sender_address: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sender_country">Sender Country *</Label>
                        <Input
                          id="sender_country"
                          value={newShipment.sender_country}
                          onChange={(e) => setNewShipment({...newShipment, sender_country: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sender_email">Sender Email</Label>
                        <Input
                          id="sender_email"
                          type="email"
                          value={newShipment.sender_email}
                          onChange={(e) => setNewShipment({...newShipment, sender_email: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Receiver Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Receiver Information</h3>
                      <div>
                        <Label htmlFor="receiver_name">Receiver Name *</Label>
                        <Input
                          id="receiver_name"
                          value={newShipment.receiver_name}
                          onChange={(e) => setNewShipment({...newShipment, receiver_name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiver_address">Receiver Address *</Label>
                        <Textarea
                          id="receiver_address"
                          value={newShipment.receiver_address}
                          onChange={(e) => setNewShipment({...newShipment, receiver_address: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiver_country">Receiver Country *</Label>
                        <Input
                          id="receiver_country"
                          value={newShipment.receiver_country}
                          onChange={(e) => setNewShipment({...newShipment, receiver_country: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiver_email">Receiver Email</Label>
                        <Input
                          id="receiver_email"
                          type="email"
                          value={newShipment.receiver_email}
                          onChange={(e) => setNewShipment({...newShipment, receiver_email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="origin">Origin *</Label>
                      <Input
                        id="origin"
                        value={newShipment.origin}
                        onChange={(e) => setNewShipment({...newShipment, origin: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="destination">Destination *</Label>
                      <Input
                        id="destination"
                        value={newShipment.destination}
                        onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={newShipment.weight}
                        onChange={(e) => setNewShipment({...newShipment, weight: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="package_description">Package Description *</Label>
                      <Textarea
                        id="package_description"
                        value={newShipment.package_description}
                        onChange={(e) => setNewShipment({...newShipment, package_description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="package_value">Package Value *</Label>
                          <Input
                            id="package_value"
                            type="number"
                            step="0.01"
                            value={newShipment.package_value}
                            onChange={(e) => setNewShipment({...newShipment, package_value: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={newShipment.currency} onValueChange={(value) => setNewShipment({...newShipment, currency: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((curr) => (
                                <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shipping_fee">Shipping Fee</Label>
                          <Input
                            id="shipping_fee"
                            type="number"
                            step="0.01"
                            value={newShipment.shipping_fee}
                            onChange={(e) => setNewShipment({...newShipment, shipping_fee: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="days_of_package">Delivery Days</Label>
                          <Input
                            id="days_of_package"
                            type="number"
                            value={newShipment.days_of_package}
                            onChange={(e) => setNewShipment({...newShipment, days_of_package: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Media Upload (Optional)</h3>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6">
                      {!mediaPreview ? (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Upload an image or video</p>
                            <p className="text-xs text-muted-foreground">
                              Supported formats: JPEG, PNG, GIF, MP4, WebM, OGG (Max 50MB)
                            </p>
                            <Input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg"
                              onChange={handleMediaUpload}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Media Preview</p>
                            <Button variant="outline" size="sm" onClick={removeMedia}>
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          <div className="flex justify-center">
                            {mediaFile?.type.startsWith('image/') ? (
                              <img
                                src={mediaPreview}
                                alt="Media preview"
                                className="max-h-48 max-w-full rounded-lg object-contain"
                              />
                            ) : (
                              <video
                                src={mediaPreview}
                                controls
                                className="max-h-48 max-w-full rounded-lg"
                              />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            File: {mediaFile?.name} ({(mediaFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                    {isLoading ? 'Creating Shipment...' : 'Create Shipment & Generate Tracking ID'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Shipments Tab */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Search className="mr-2 w-5 h-5" />
                    Manage Shipments
                  </div>
                  <Button variant="outline" onClick={fetchShipments}>
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipments.map((shipment: any) => (
                    <div key={shipment.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono font-bold text-lg">{shipment.tracking_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.origin} → {shipment.destination}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${
                            shipment.current_status.toLowerCase().includes('delivered') ? 'bg-success' :
                            shipment.is_customs_held ? 'bg-destructive' :
                            'bg-primary'
                          } text-white`}>
                            {shipment.current_status}
                          </Badge>
                          {shipment.is_customs_held && (
                            <Badge variant="destructive">Customs Hold</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                        <div>
                          <p className="text-muted-foreground text-xs">Package Value</p>
                          <p className="font-semibold">{shipment.currency} {shipment.package_value?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Shipping Fee</p>
                          <p className="font-semibold">{shipment.currency} {shipment.shipping_fee?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Delivery Days</p>
                          <p className="font-semibold">{shipment.days_of_package || 'N/A'} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Weight</p>
                          <p className="font-semibold">{shipment.weight?.toFixed(1) || 'N/A'} kg</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateShipmentStatus(shipment.id, 'In Transit')}
                        >
                          Mark In Transit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateShipmentStatus(shipment.id, 'Out for Delivery')}
                        >
                          Out for Delivery
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateShipmentStatus(shipment.id, 'Delivered')}
                        >
                          Mark Delivered
                        </Button>
                        <Button 
                          variant={shipment.is_customs_held ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleCustomsHold(shipment.id, shipment.is_customs_held)}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {shipment.is_customs_held ? 'Clear Customs' : 'Hold at Customs'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/track/${shipment.tracking_id}`;
                            navigator.clipboard.writeText(url);
                            toast.success('Link copied!');
                          }}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  ))}

                  {shipments.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No shipments found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{shipments.length}</div>
                    <div className="text-sm text-muted-foreground">Total Shipments</div>
                  </div>
                  <div className="text-center p-6 bg-success/5 rounded-lg">
                    <div className="text-3xl font-bold text-success">
                      {shipments.filter((s: any) => s.current_status.toLowerCase().includes('delivered')).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                  <div className="text-center p-6 bg-warning/5 rounded-lg">
                    <div className="text-3xl font-bold text-warning">
                      {shipments.filter((s: any) => s.is_customs_held).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Customs Hold</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;