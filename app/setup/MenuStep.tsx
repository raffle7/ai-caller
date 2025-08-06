import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

function MenuStep({ form, setForm, prevStep, nextStep }: { form: any; setForm: any; prevStep: () => void; nextStep: () => void }) {
  const [category, setCategory] = React.useState("");
  const [menuItem, setMenuItem] = React.useState({ name: "", price: "", category: "" });
  const [deal, setDeal] = React.useState({ name: "", description: "" });

  // Add category
  const addCategory = () => {
    if (category && !form.menu.some((cat: any) => cat.category === category)) {
      setForm((f: any) => ({ ...f, menu: [...f.menu, { category, items: [] }] }));
      setCategory("");
    }
  };

  // Add menu item
  const addMenuItem = () => {
    if (menuItem.name && menuItem.price && menuItem.category) {
      setForm((f: any) => ({
        ...f,
        menu: f.menu.map((cat: any) =>
          cat.category === menuItem.category
            ? { ...cat, items: [...cat.items, { name: menuItem.name, price: menuItem.price }] }
            : cat
        ),
      }));
      setMenuItem({ name: "", price: "", category: "" });
    }
  };

  // Add deal
  const addDeal = () => {
    if (deal.name && deal.description) {
      setForm((f: any) => ({ ...f, deals: [...f.deals, { ...deal }] }));
      setDeal({ name: "", description: "" });
    }
  };
  console.log(form.menu)

  return (
    <div className="space-y-6">
      {/* Category creation */}
      <div>
        <h3 className="font-semibold mb-2">Create Menu Category</h3>
        <div className="flex gap-2 mb-2">
          <Input placeholder="Category Name" value={category} onChange={e => setCategory(e.target.value)} />
          <Button onClick={addCategory}>Add Category</Button>
        </div>
        <ul className="list-disc pl-5">
          {form.menu.map((cat: any) => (
            <li key={cat.category}>{cat.category}</li>
          ))}
        </ul>
      </div>
      {/* Menu item creation */}
      <div>
        <h3 className="font-semibold mb-2">Create Menu in Selected Category</h3>
        <div className="flex gap-2 mb-2">
          <Select
  value={menuItem.category || ""}
  onValueChange={(v) => setMenuItem((mi) => ({ ...mi, category: v }))}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select Category" />
  </SelectTrigger>
  <SelectContent>
    {form.menu.length === 0 ? (
      <SelectItem value="__placeholder__" disabled>
        No categories available
      </SelectItem>
    ) : (
      form.menu.map((cat: any) => (
        <SelectItem key={cat.category} value={cat.category}>
          {cat.category}
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>
          <Input placeholder="Item Name" value={menuItem.name} onChange={e => setMenuItem(mi => ({ ...mi, name: e.target.value }))} />
          <Input placeholder="Price" type="number" value={menuItem.price} onChange={e => setMenuItem(mi => ({ ...mi, price: e.target.value }))} />
          <Button onClick={addMenuItem}>Add Item</Button>
        </div>
        {/* Show items by category */}
        {form.menu.map((cat: any) => (
          <div key={cat.category} className="mb-2">
            <div className="font-medium">{cat.category}</div>
            <ul className="list-disc pl-5">
              {(cat.items ?? []).map((item: any, idx: number) => (
                <li key={idx}>{item.name} - ${item.price}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Deals creation */}
      <div>
        <h3 className="font-semibold mb-2">Create Deals</h3>
        <div className="flex gap-2 mb-2">
          <Input placeholder="Deal Name" value={deal.name} onChange={e => setDeal(d => ({ ...d, name: e.target.value }))} />
          <Input placeholder="Description" value={deal.description} onChange={e => setDeal(d => ({ ...d, description: e.target.value }))} />
          <Button onClick={addDeal}>Add Deal</Button>
        </div>
        <ul className="list-disc pl-5">
          {form.deals.map((d: any, idx: number) => (
            <li key={idx}>{d.name}: {d.description}</li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep}>Next</Button>
      </div>
    </div>
  );
}

export default MenuStep;
