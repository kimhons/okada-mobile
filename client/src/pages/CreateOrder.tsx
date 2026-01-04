import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  User,
  MapPin,
  CreditCard,
} from "lucide-react";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export default function CreateOrder() {
  const [, navigate] = useLocation();
  
  // Form state
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  
  const [productOpen, setProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  const [deliveryZoneId, setDeliveryZoneId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mtn_money" | "orange_money" | "cash">("cash");
  const [notes, setNotes] = useState("");
  
  // Queries
  const { data: customers = [], isLoading: customersLoading } = trpc.orders.getCustomers.useQuery({
    search: customerSearch || undefined,
    limit: 50,
  });
  
  const { data: products = [], isLoading: productsLoading } = trpc.orders.getProducts.useQuery({
    search: productSearch || undefined,
    limit: 50,
  });
  
  const { data: deliveryZones = [] } = trpc.orders.getDeliveryZones.useQuery();
  
  // Mutations
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Order ${data.orderNumber} created successfully!`);
      navigate("/orders");
    },
    onError: (error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
  
  // Computed values
  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === customerId),
    [customers, customerId]
  );
  
  const selectedZone = useMemo(() =>
    deliveryZones.find(z => z.id === Number(deliveryZoneId)),
    [deliveryZones, deliveryZoneId]
  );
  
  const subtotal = useMemo(() =>
    orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [orderItems]
  );
  
  const deliveryFee = selectedZone?.baseFee || 0;
  const total = subtotal + deliveryFee;
  
  // Handlers
  const addProduct = (product: typeof products[0]) => {
    const existing = orderItems.find(item => item.productId === product.id);
    if (existing) {
      setOrderItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems(items => [
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
        },
      ]);
    }
    setProductOpen(false);
    setProductSearch("");
  };
  
  const updateQuantity = (productId: number, delta: number) => {
    setOrderItems(items =>
      items.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };
  
  const removeItem = (productId: number) => {
    setOrderItems(items => items.filter(item => item.productId !== productId));
  };
  
  const handleSubmit = () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (orderItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }
    if (!deliveryZoneId) {
      toast.error("Please select a delivery zone");
      return;
    }
    
    createOrderMutation.mutate({
      customerId,
      items: orderItems,
      deliveryAddress,
      pickupAddress: pickupAddress || undefined,
      paymentMethod,
      deliveryFee,
      notes: notes || undefined,
    });
  };
  
  const formatPrice = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Order</h1>
            <p className="text-muted-foreground">
              Create a new order for a customer
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer
                </CardTitle>
                <CardDescription>
                  Select the customer for this order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerOpen}
                      className="w-full justify-between"
                    >
                      {selectedCustomer ? (
                        <span>{selectedCustomer.name || selectedCustomer.email}</span>
                      ) : (
                        <span className="text-muted-foreground">Select customer...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search customers..."
                        value={customerSearch}
                        onValueChange={setCustomerSearch}
                      />
                      <CommandList>
                        {customersLoading ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading customers...
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={`${customer.name} ${customer.email}`}
                                  onSelect={() => {
                                    setCustomerId(customer.id);
                                    setCustomerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      customerId === customer.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span>{customer.name || "Unnamed Customer"}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {customer.email || "No email"}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
            
            {/* Products Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products
                </CardTitle>
                <CardDescription>
                  Add products to this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Popover open={productOpen} onOpenChange={setProductOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search products..."
                        value={productSearch}
                        onValueChange={setProductSearch}
                      />
                      <CommandList>
                        {productsLoading ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading products...
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No product found.</CommandEmpty>
                            <CommandGroup>
                              {products.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.name}
                                  onSelect={() => addProduct(product)}
                                >
                                  <div className="flex w-full items-center justify-between">
                                    <div className="flex flex-col">
                                      <span>{product.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        Stock: {product.stock}
                                      </span>
                                    </div>
                                    <Badge variant="secondary">
                                      {formatPrice(product.price)}
                                    </Badge>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {orderItems.length > 0 ? (
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No products added yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Delivery Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Details
                </CardTitle>
                <CardDescription>
                  Enter delivery and pickup information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryZone">Delivery Zone *</Label>
                  <Select value={deliveryZoneId} onValueChange={setDeliveryZoneId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryZones.map((zone) => (
                        <SelectItem key={zone.id} value={String(zone.id)}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{zone.name} ({zone.city})</span>
                            <Badge variant="outline">
                              {formatPrice(zone.baseFee)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Enter the full delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Pickup Address (Optional)</Label>
                  <Textarea
                    id="pickupAddress"
                    placeholder="Enter pickup address if different from default"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Payment & Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                      <SelectItem value="mtn_money">MTN Mobile Money</SelectItem>
                      <SelectItem value="orange_money">Orange Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for this order"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCustomer && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCustomer.email || "No email"}
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Items ({orderItems.reduce((sum, i) => sum + i.quantity, 0)})
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Order
                    </>
                  )}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  Order will be created with "Pending" status
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
