# 🍕 Pizza Images — Upload Guide (Cloudinary) ✅ VERIFIED AGAINST YOUR ACCOUNT

## Your actual Cloudinary structure (confirmed working — keep as it is)

```
Home
└── Desserty House/
    ├── previous-orders/          ← 46 gallery images: dh-showcase-01 … dh-showcase-46 ✔ all working
    └── selection/
        ├── pizza/                ← YOU CREATED THIS ✔ correct place — now upload the 10 images here
        ├── bento/                ✔ working
        ├── birthday/             ✔ working
        ├── bomboloni/            ✔ working
        ├── brownies/             ✔ working
        ├── cupcakes/             ✔ working
        ├── donuts/               ✔ working
        └── fondant/              ✔ working
```

**Nothing needs to change** — the website code matches this structure exactly.
All 46 showcase images and all 7 existing product folders were live-tested and
every one redirects correctly to Cloudinary (HTTP 307 → 200).

## Only remaining step: upload the 10 pizza images

The `pizza` folder exists but is still empty (live test returns 404).

1. Cloudinary → Media Library → **Desserty House → selection → pizza**
2. Click **Upload** and add the 10 files from `pizza-images.zip`, in this order:

| Upload file | Cloudinary name must start with | Style shown on website |
|---|---|---|
| pizza-1.jpg | `pizza-1` | PIZ-01 Margherita |
| pizza-2.jpg | `pizza-2` | PIZ-02 Farmhouse Veggie |
| pizza-3.jpg | `pizza-3` | PIZ-03 Corn & Cheese |
| pizza-4.jpg | `pizza-4` | PIZ-04 Paneer Tikka |
| pizza-5.jpg | `pizza-5` | PIZ-05 Mushroom |
| pizza-6.jpg | `pizza-6` | PIZ-06 Tandoori Paneer |
| pizza-7.jpg | `pizza-7` | PIZ-07 Chicken Tikka |
| pizza-8.jpg | `pizza-8` | PIZ-08 Pepperoni |
| pizza-9.jpg | `pizza-9` | PIZ-09 BBQ Chicken |
| pizza-10.jpg | `pizza-10` | PIZ-10 Cheese Burst |

Cloudinary will add a random suffix (e.g. `pizza-1_ab12cd`) — that is fine,
the media API matches it automatically (same as your `dh-showcase-46_ehsejs`).
Just don't rename the files before uploading.

## Verify after uploading

Open these in your browser:

- `https://desserty-house.vercel.app/api/media?path=%2Fcollections%2Fpizza%2Fpizza-1.jpg`
  → should redirect to a Cloudinary pizza image
- `https://desserty-house.vercel.app/menu/pizza`
  → all 10 pizza styles should display (after you deploy the updated code)

## Note on gallery images (correction)

An earlier check reported showcase images as broken — that was a false alarm
caused by testing un-padded names (`dh-showcase-1` instead of `dh-showcase-01`).
The website code correctly uses zero-padded names, and **all 46 gallery images
are confirmed working**. No action needed.
