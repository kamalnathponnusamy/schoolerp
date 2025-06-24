"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, AlertTriangle, Download, Edit, Trash2, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InventoryItem {
  id: number
  item_code: string
  item_name: string
  category: string
  description: string
  available_quantity: number
  issued_quantity: number
  total_quantity: number
  unit_price: number
  supplier: string
  min_stock_level: number
  stock_status: string
  quantity_available: number
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  const [newItem, setNewItem] = useState({
    item_name: "",
    item_code: "",
    category: "",
    description: "",
    total_quantity: "",
    unit_price: "",
    supplier: "",
    min_stock_level: "",
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch("/api/inventory")

      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      } else {
        throw new Error("Failed to fetch inventory")
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setError("Failed to load inventory. Please refresh the page.")
      setInventory([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate required fields
      if (
        !newItem.item_name ||
        !newItem.category ||
        !newItem.total_quantity ||
        !newItem.unit_price ||
        !newItem.supplier
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Generate item code from category and name
      const categoryPrefix = newItem.category.substring(0, 3).toUpperCase()
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const itemCode = `${categoryPrefix}${randomNum}`

      const itemData = {
        item_name: newItem.item_name,
        item_code: itemCode,
        category: newItem.category,
        description: newItem.description,
        total_quantity: Number(newItem.total_quantity),
        unit_price: Number(newItem.unit_price),
        supplier: newItem.supplier,
        status: "active"
      }

      // Validate numeric values
      if (isNaN(itemData.total_quantity) || isNaN(itemData.unit_price)) {
        toast({
          title: "Error",
          description: "Please enter valid numeric values",
          variant: "destructive",
        })
        return
      }

      if (itemData.total_quantity < 0 || itemData.unit_price < 0) {
        toast({
          title: "Error",
          description: "Values cannot be negative",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message || "Inventory item added successfully",
        })
        setIsAddModalOpen(false)
        resetForm()
        fetchInventory()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add inventory item",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setNewItem({
      item_name: "",
      item_code: "",
      category: "",
      description: "",
      total_quantity: "",
      unit_price: "",
      supplier: "",
      min_stock_level: "",
    })
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(inventory.map((item) => item.category))]
  const totalItems = inventory.length
  const lowStockItems = inventory.filter((item) => item.stock_status === "low_stock").length
  const outOfStockItems = inventory.filter((item) => item.stock_status === "out_of_stock").length
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.quantity_available * (item.unit_price || 0),
    0
  )

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800"
      case "out_of_stock":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <div className="lg:pl-64"> */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button variant="outline" size="sm" className="ml-2" onClick={fetchInventory}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Inventory Management</h1>
              <p className="text-muted-foreground">Track and manage school inventory items</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="item_name">Item Name *</Label>
                        <Input
                          id="item_name"
                          value={newItem.item_name}
                          onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                          placeholder="Mathematics Textbook"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Books">Books</SelectItem>
                            <SelectItem value="Stationery">Stationery</SelectItem>
                            <SelectItem value="Laboratory">Laboratory</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Uniform">Uniform</SelectItem>
                            <SelectItem value="Computer">Computer</SelectItem>
                            <SelectItem value="Furniture">Furniture</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          placeholder="Brief description of the item"
                        />
                      </div>
                      <div>
                        <Label htmlFor="total_quantity">Total Quantity *</Label>
                        <Input
                          id="total_quantity"
                          type="number"
                          min="0"
                          value={newItem.total_quantity}
                          onChange={(e) => setNewItem({ ...newItem, total_quantity: e.target.value })}
                          placeholder="100"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit_price">Unit Price (₹) *</Label>
                        <Input
                          id="unit_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newItem.unit_price}
                          onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                          placeholder="250.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="supplier">Supplier *</Label>
                        <Input
                          id="supplier"
                          value={newItem.supplier}
                          onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                          placeholder="Educational Publishers Ltd"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="min_stock_level">Minimum Stock Level *</Label>
                        <Input
                          id="min_stock_level"
                          type="number"
                          min="0"
                          value={newItem.min_stock_level}
                          onChange={(e) => setNewItem({ ...newItem, min_stock_level: e.target.value })}
                          placeholder="10"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Item</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{totalItems}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                    <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm font-semibold">!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-semibold">₹</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by item name or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Available Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.item_name}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-48">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              item.available_quantity <= item.min_stock_level ? "text-red-600 font-semibold" : ""
                            }
                          >
                            {item.available_quantity}
                          </span>
                        </TableCell>
                        <TableCell>₹{item.unit_price.toLocaleString()}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <Badge className={getStockStatusColor(item.stock_status)}>
                            {item.stock_status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      {/* </div> */}
    </div>
  )
}
