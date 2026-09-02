# Zesix Night — asset drop manifest

Put files here and the site picks them up automatically. Missing files degrade
gracefully (empty tile / "asset slot" frame), so you can fill this in stages.

All images: **JPG or PNG**, longest edge ~1600px is plenty (a build step will
compress + generate WebP/AVIF later). Videos: **MP4 (H.264)**, muted, ≤ ~15 MB
each — these are temporary; YouTube embeds replace them later.

Filenames are **numbered, zero-padded**: `01.jpg`, `02.jpg`, … / `01.mp4`, …

```
Zesix Night/
  public/assets/
    portfolio/
      classic-group/
        logo.png                      ← brand logo (transparent PNG)
        ai-reels/        01.mp4 … 04.mp4     (AI-driven reels)
        posts/           01.jpg … 06.jpg     (creative posts)
        expo-stall/      01.jpg              (expo stall photo)
        hoarding/        hoarding-01.jpg     (billboard artwork, wide)
        pole-kiosks/     01.jpg              (pole kiosk artwork, tall)
        newspaper/       01.jpg              (full newspaper page scan/export)
        # Ad film + 3 influencer reels are already wired as embeds (YouTube / Instagram)
      kaaya-unisex-salon/
        logo.png
        reels/           01.mp4 … 04.mp4
        ai-reel/         ai-reel-01.mp4
        posts/           01.jpg … 06.jpg
        # 1 influencer reel already wired as an Instagram embed
      customise-world/
        logo.png
        reels/           01.mp4 … 04.mp4
        catalogue/       01.jpg … 08.jpg     (catalogue pages, in order — export the PDF to images)
        company-profile/ 01.jpg … 08.jpg     (company profile pages, in order)
        # testimonial reel already wired as an Instagram embed
      ruchikara/
        logo.png
        reels/           01.mp4 … 04.mp4
        ai-reel/         ai-reel-01.mp4
        posts/           01.jpg … 06.jpg
        catalogue/       01.jpg … 08.jpg
      riston-automobiles/
        logo.png
        ai-reels/        01.mp4 … 04.mp4
        posts/           01.jpg … 06.jpg
      gymsane/
        logo.png
        posts/           01.jpg … 06.jpg
        pole-kiosks/     01.jpg
      dr-wasi-khan-health-hub/
        logo.png
        # 3 videos already wired as YouTube embeds
      aqs-foundation/
        logo.png
        # 3 videos already wired as YouTube embeds
    og/
      default.png                     ← 1200×630 social share image
```

## Already wired (no files needed)
- Classic Group ad film → `youtube.com/embed/Z8eMbgahMt0`
- Classic Group influencer → 3 Instagram reels
- Kaaya influencer → 1 Instagram reel
- Customise World testimonial reel → 1 Instagram reel
- Dr. Wasi Khan / AQS Foundation → 3 YouTube videos each
- Homepage testimonial reel → Customise World Instagram reel

## To change what shows / add a brand
Edit `content/projects.json`, then `npm run gen`. Each showcase item has a
`mode`: `gallery`, `gallery-video`, `mockup-billboard`, `mockup-kiosk`,
`mockup-newspaper`, `mockup-stand`, `mockup-phone`, `video-embed`, `ig-reel`,
`book-flip`, `note`.

## Client logos I already have locally (can be copied in)
`D:\ZESIX STUDIO\ZESIX\Client logos\` — Classic Group, Customise World, Riston.
Kaaya, Ruchikara, Gymsane, Health Hub, AQS, Laddoo Gopal, Elements logos are
still needed (or the site shows the brand name instead).
