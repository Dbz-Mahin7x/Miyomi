# <img src="public/icons/icon-192.png" width="30px"> Miyomi 2.0 - BETA

Your comprehensive index for anime, manga, and light novel apps, extensions, and resources!

Kindly consider giving the repository a ⭐ star. This motivates us to enhance the app further. Also, don't hesitate to [contribute](#-contributing) by keeping our data up-to-date!

🌐 **Live:** [miyomi.pages.dev](https://miyomi.pages.dev)

## 📖 About

Miyomi is a modern web application designed to help fellow weebs easily discover and access:

- 📱 **Apps** - Android, iOS, and Desktop applications for reading manga, watching anime, and reading light novels
- 🧩 **Extensions** - Curated extension repositories for popular apps like Aniyomi, Mihon, Tachiyomi, and more
- 📚 **Guides** - Step-by-step tutorials for installation, configuration, and troubleshooting
- 🌐 **Resources** - Curated websites, communities, and FAQs for the otaku community


## 🤝 Contributing

We welcome contributions! Here's how you can help keep Miyomi up-to-date:

### Adding or Updating Apps

Navigate to `src/data/apps.json` and add or update app entries:

```json
{
  "id": "app-id",
  "name": "App Name",
  "status": "discontinued",
  "author": "Author or Team Name",
  "contentTypes": ["Manga", "Anime", "Light Novel"],
  "description": "Brief description of the app",
  "platforms": ["Android", "iOS", "Windows", "Mac", "Linux", "Web"],
  "iconColor": "#FF6B9D",
  "logoUrl": "https://avatars.githubusercontent.com/username",
  "keywords": ["keyword1", "keyword2"],
  "supportedExtensions": ["extension-id-1", "extension-id-2"],
  "forkOf": "Parent App Name",
  "upstreamUrl": "https://github.com/parent/repository",
  "upstreamUrl": "https://github.com/parent/repository",
  "githubUrl": "https://github.com/owner/repository",
  "officialSite": "https://example.com",
  "discordUrl": "https://discord.gg/invite",
  "tutorials": [
    {
      "title": "Tutorial Title",
      "type": "video",
      "url": "https://youtube.com/...",
      "description": "Tutorial description"
    }
  ]
}
```

**Important:**
- `status`: Optional; accepted values like `"active", "discontinued"`, `"abandoned"`, `"suspended"`, `"dmca"`, `"dead"`.
- `author`: Optional; shown in the UI. Falls back to the GitHub repo owner if omitted.
- `forkOf`: Optional; name of the parent app this is forked from.
- `upstreamUrl`: Optional; URL to the parent app's repository or site.
- `githubUrl`: **CRITICAL** — Provide this if available. The system automatically fetches `downloads` and `lastUpdated` from this URL every 24h.
- **Do NOT manually add** `downloads` or `lastUpdated` — these are handled dynamically by our CI/CD pipeline and stored in a separate `app-meta.json` file on the `data-updates` branch.
- `contentTypes`: Must be one of: "Manga", "Anime", "Light Novel"
- `platforms`: Must be one of: "Android", "iOS", "Windows", "Mac", "Linux", "Web"

### Adding or Updating Extensions

Navigate to `src/data/extensions.json` and add or update extension entries:

```json
{
  "id": "extension-id",
  "name": "Extension Name",
  "types": ["Anime", "Manga"],
  "region": "ALL",
  "accentColor": "#FF6B9D",
  "autoUrl": "aniyomi://add-repo?url=...",
  "manualUrl": "https://raw.githubusercontent.com/...",
  "website": "https://github.com/...",
  "github": "https://github.com/owner/repo",
  "supportedApps": ["aniyomi", "mihon", "mangayomi"],
  "info": "Brief description",
  "keywords": ["keyword1", "keyword2"],
  "lastUpdated": "2025-01-15"
}
```

**Region Codes:**
- Use ISO country codes (e.g., "US", "BR", "FR", "JP")
- Use "ALL" for global extensions
- Multiple regions: "BR,TR" (comma-separated)

### Adding Guides

Navigate to `src/data/guides.json` and add your guide to the appropriate category:

```json
{
  "id": "category-id",
  "title": "Category Title",
  "description": "Category description",
  "color": "#FF6B9D",
  "icon": "download",
  "guides": [
    {
      "id": "unique-guide-id",
      "title": "Guide Title",
      "slug": "guide-url-slug",
      "keywords": ["search", "keywords"]
    }
  ]
}
```

### Adding Other Resources

- **FAQs:** Edit `src/data/faqs.json`

### How to Submit

#### Option 1: Pull Request (Preferred)
1. Fork the repository
2. Create a new branch (`git checkout -b add-new-app`)
3. Make your changes to the appropriate JSON files
4. Test locally (`npm run dev`)
5. Commit your changes (`git commit -m 'Add: New app XYZ'`)
6. Push to your fork (`git push origin add-new-app`)
7. Open a Pull Request with a clear description

#### Option 2: GitHub Issue
Create an [issue](https://github.com/tas33n/miyomi/issues/new) with:
- App/Extension name
- Description
- Platform(s)
- Links (GitHub, website, etc.)
- Why it should be added

> [!NOTE]
> Pull requests with properly formatted JSON are easier to review and will be merged faster!

> [!WARNING]
> We may choose not to add submissions if they are redundant or don't meet our quality standards.

## 📜 License
```
Copyright © 2025 Tas33n. Apache License 2.0

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
### Important Disclaimers
- Miyomi is an **independent, fan-run** information hub
- We are **not affiliated** with any third-party developers or companies
- All external links are for **educational purposes only**
- We do **not** host, distribute, or modify copyrighted content

### Key Legal Points
- **Non-Affiliation**: Not connected to any third-party projects we reference
- **Educational Purpose**: All content provided for informational use only
- **User Responsibility**: Users verify legality of third-party services
- **Content Moderation**: We reserve right to remove inappropriate content
- **Liability Limitation**: Not responsible for third-party services



## 🙏 Acknowledgment

- **Inspired by:** [Wotaku](https://github.com/wotakumoe/Wotaku) - A great otaku resource index
- Thank's to all open-source developers for creating and providing these amazing apps, extensions, and resources!

---

**Made with ❤️ for the otaku community**

*Found a bug? Have a suggestion? [Open an issue](https://github.com/tas33n/miyomi/issues) or contribute directly!*


[![Terms of Service](https://img.shields.io/badge/Terms_of_Service-Read_Here-blue?style=for-the-badge)](https://miyomi-test.github.io/)
[![Privacy Policy](https://img.shields.io/badge/Privacy_Policy-Read_Here-green?style=for-the-badge)](https://miyomi-test.github.io/)
[![Contact](https://img.shields.io/badge/Contact-Email_Us-red?style=for-the-badge)](mailto:miyomi.hub@gmail.com)
