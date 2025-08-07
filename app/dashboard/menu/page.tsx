"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";

interface MenuItem {
  name: string;
  price: number;
  description: string;
  category: string;
}

interface Category {
  name: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState<MenuItem>({
    name: "",
    price: 0,
    description: "",
    category: "",
  });

  const handleAddCategory = () => {
    if (newCategory) {
      setCategories([...categories, { name: newCategory, items: [] }]);
      setNewCategory("");
    }
  };

  const handleAddItem = (categoryName: string) => {
    if (newItem.name && newItem.price) {
      setCategories(
        categories.map((cat) =>
          cat.name === categoryName
            ? {
                ...cat,
                items: [...cat.items, { ...newItem, category: categoryName }],
              }
            : cat
        )
      );
      setNewItem({ name: "", price: 0, description: "", category: "" });
    }
  };

  const handleRemoveItem = (categoryName: string, itemIndex: number) => {
    setCategories(
      categories.map((cat) =>
        cat.name === categoryName
          ? {
              ...cat,
              items: cat.items.filter((_, index) => index !== itemIndex),
            }
          : cat
      )
    );
  };

  const handleSaveMenu = async () => {
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
      });
      if (res.ok) {
        // Show success message
      }
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button onClick={handleSaveMenu}>Save Changes</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={categories[0]?.name} className="w-full">
        <TabsList className="w-full justify-start">
          {categories.map((category) => (
            <TabsTrigger key={category.name} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.name} value={category.name}>
            <Card>
              <CardHeader>
                <CardTitle>Items in {category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add new item form */}
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newItem.price || ""}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <Button onClick={() => handleAddItem(category.name)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    {category.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(category.name, index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
