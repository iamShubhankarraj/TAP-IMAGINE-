# Features Showcase

This directory contains the features showcase page and its content model.

## Structure

- `page.tsx` - Main features page component with animations and carousels
- `features-config.json` - Content model for all features (current and coming-soon)
- `carousel-data.json` - Before/after comparison carousel content

## Content Model

### Features Configuration (`features-config.json`)

The features configuration follows this structure:

```json
{
  "categories": [
    {
      "id": "string",           // Unique category identifier
      "name": "string",          // Display name
      "description": "string",   // Category description
      "icon": "string"          // Lucide icon name
    }
  ],
  "features": [
    {
      "id": "string",                    // Unique feature identifier
      "name": "string",                  // Feature display name
      "shortDescription": "string",      // Brief one-liner
      "description": "string",           // Detailed description
      "status": "current|coming-soon",   // Feature status
      "category": "string",              // Category ID
      "icon": "string",                  // Lucide icon name
      "deepLink": "string",              // Link to feature in editor or roadmap
      "highlights": ["string"]           // Key feature highlights (3-4 items)
    }
  ]
}
```

### Categories

Current categories match the product structure:
- **AI Transformations** - AI-powered image generation and manipulation
- **Editing Tools** - Professional image adjustment and manipulation
- **Creative Templates** - Pre-built styles and effects
- **Export & Share** - Output and sharing options
- **Collaboration** - Team and social features

### Feature Status

- `current` - Available now (shown with green badge)
- `coming-soon` - On the roadmap (shown with purple badge)

### Deep Links

Deep links allow users to jump directly to relevant sections:
- `/editor?focus=prompt` - Opens editor with prompt panel focused
- `/editor?focus=adjustments` - Opens editor with adjustments panel
- `/editor?focus=export` - Opens editor with export options
- `/templates` - Links to templates page
- `/roadmap#feature-id` - Links to roadmap section (anchor)

## Carousel Configuration (`carousel-data.json`)

The comparison carousel showcases before/after transformations:

```json
{
  "comparisons": [
    {
      "id": "string",           // Unique comparison identifier
      "title": "string",        // Comparison title
      "description": "string",  // Brief description
      "category": "string",     // Category ID
      "beforeLabel": "string",  // Label for before state
      "afterLabel": "string",   // Label for after state
      "prompt": "string"        // Example prompt used
    }
  ]
}
```

## Adding New Features

To add a new feature:

1. Open `features-config.json`
2. Add a new feature object to the `features` array:
   ```json
   {
     "id": "unique-feature-id",
     "name": "Feature Name",
     "shortDescription": "Brief description",
     "description": "Detailed explanation of the feature",
     "status": "coming-soon",
     "category": "appropriate-category-id",
     "icon": "LucideIconName",
     "deepLink": "/roadmap#feature-id",
     "highlights": [
       "Key benefit 1",
       "Key benefit 2",
       "Key benefit 3"
     ]
   }
   ```
3. Choose appropriate category and status
4. Use a Lucide icon name (see available icons in `page.tsx`)

## Adding New Categories

To add a new category:

1. Open `features-config.json`
2. Add to the `categories` array:
   ```json
   {
     "id": "category-id",
     "name": "Category Name",
     "description": "Category description",
     "icon": "LucideIconName"
   }
   ```
3. Update the icon mapping in `page.tsx` if using a new icon

## Adding Comparison Slides

To add a new before/after comparison:

1. Open `carousel-data.json`
2. Add to the `comparisons` array:
   ```json
   {
     "id": "comparison-id",
     "title": "Transformation Title",
     "description": "What this demonstrates",
     "category": "category-id",
     "beforeLabel": "Before state label",
     "afterLabel": "After state label",
     "prompt": "Example prompt used"
   }
   ```

## Available Icons

Currently supported Lucide icons:
- Wand2, Palette, Grid3X3, Download, Users
- MessageSquare, Layers, Sparkles, SlidersHorizontal
- Filter, Crop, RotateCw, Lock, FolderOpen
- Eraser, Scissors, Brush, Paintbrush, Cloud
- Share2, Code

To add more icons:
1. Import from `lucide-react` in `page.tsx`
2. Add to the `iconMap` object

## Animations

The page includes several animations:
- Scroll-triggered fade-in animations for feature cards
- Auto-playing carousel with manual controls
- Hover effects on feature cards
- Smooth transitions between filtered views

## Responsive Design

The page is fully responsive:
- Mobile: Single column layout
- Tablet: 2 column grid
- Desktop: 3 column grid
- Sticky filter bar on scroll
- Mobile-friendly carousel controls

## Deep Link Parameters

The editor supports focus parameters:
- `?focus=prompt` - Highlights the prompt panel
- `?focus=reference` - Highlights reference upload
- `?focus=adjustments` - Opens adjustments panel
- `?focus=filters` - Opens filters panel
- `?focus=export` - Opens export panel

## Maintenance

This content model is designed to be:
- **Easy to update** - JSON configuration without code changes
- **Self-documenting** - Clear structure and naming
- **Scalable** - Easy to add features and categories
- **Consistent** - Uniform structure across all features
