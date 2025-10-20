# 🎨 Lasso Selection Tool - Area-Specific Editing Feature

## Overview
The Lasso Selection Tool allows users to select specific areas of an image and apply AI-powered transformations to **only that region**, keeping the rest of the image unchanged.

## Features

### 1. Interactive Selection
- **Point-and-Click Interface**: Click on the canvas to create selection points
- **Visual Feedback**: Yellow highlighted selection path with semi-transparent fill
- **Dynamic Preview**: See your selection in real-time as you add points
- **Minimum 3 Points**: At least 3 points required to create a valid selection

### 2. Area-Specific AI Editing
- **Isolated Changes**: AI only modifies the selected region
- **Context-Aware**: AI understands the surrounding image for seamless blending
- **Flexible Prompts**: Describe any transformation (color changes, object additions, style modifications)

### 3. User-Friendly Controls
- **Clear Button**: Remove all points and start over
- **Complete Selection**: Finalize selection and open prompt modal
- **Cancel**: Exit without making changes
- **Point Counter**: Real-time display of selected points

## How to Use

### Step 1: Open the Lasso Tool
1. Upload an image in the editor
2. Click the **Scissors icon (✂️)** in the top header
3. The lasso selection tool will open in fullscreen mode

### Step 2: Create Your Selection
1. Click on the canvas to add points around the area you want to edit
2. Points will auto-connect with a yellow line
3. Add at least 3 points to form a closed selection
4. Use the **Clear** button if you need to start over

### Step 3: Enter Your Prompt
1. Click **Complete Selection** when satisfied with your area
2. A modal will open asking for your editing instruction
3. Enter a specific prompt describing the change you want
4. Click **Apply Changes** to process

### Step 4: AI Processing
1. The AI will analyze your selection and prompt
2. Only the selected area will be modified
3. The rest of the image remains unchanged
4. View the result in the main canvas

## Example Use Cases

### 1. Change Clothing Color
**Selection**: Draw around a t-shirt
**Prompt**: "Make this t-shirt red"
**Result**: Only the t-shirt changes to red

### 2. Add Objects to Sky
**Selection**: Draw around a portion of the sky
**Prompt**: "Add a bird flying in the sky"
**Result**: A bird appears only in the selected sky area

### 3. Modify Background
**Selection**: Draw around the background
**Prompt**: "Make this background blurred"
**Result**: Background becomes blurred, subject stays sharp

### 4. Change Hair Color
**Selection**: Draw around the hair
**Prompt**: "Change hair color to blonde"
**Result**: Only the hair color changes

### 5. Add Accessories
**Selection**: Draw around a person's face
**Prompt**: "Add sunglasses to this person"
**Result**: Sunglasses appear on the person

## Technical Details

### How It Works

1. **Point Collection**: User clicks create selection points (x, y coordinates)
2. **Bounding Box Calculation**: System calculates min/max coordinates
3. **Mask Generation**: White selection on black background (not sent to AI)
4. **Prompt Enhancement**: Area coordinates included in AI prompt
5. **AI Processing**: Gemini receives:
   - Original image
   - Bounding box coordinates in prompt
   - User's editing instruction
   - Instruction to preserve other areas

### Limitations

- **Gemini API Constraint**: True inpainting with mask images is not supported by Gemini 2.5 Flash Image
- **Workaround**: We send bounding box coordinates in the text prompt and instruct the AI to only modify that region
- **Accuracy**: AI interpretation-based; results may vary depending on prompt clarity and image complexity

### Prompt Format Sent to AI

```
In this image, modify ONLY the selected area at position 
x:[x_coordinate], y:[y_coordinate], 
width:[width], height:[height]. 
[USER_PROMPT]. 
Keep all other parts of the image exactly the same. 
Do not change anything outside this specific area.
```

## Tips for Best Results

1. **Be Specific**: Clearly describe the change you want
2. **Good Prompts**:
   - ✅ "Make this t-shirt bright red"
   - ✅ "Change this sky to sunset with orange and purple colors"
   - ✅ "Add a yellow bird flying in the center"

3. **Avoid Vague Prompts**:
   - ❌ "Make it better"
   - ❌ "Change this"
   - ❌ "Add something"

4. **Selection Precision**: Draw tightly around the area you want to change
5. **Complex Changes**: May require multiple iterations for best results

## Keyboard Shortcuts

Currently not implemented, but planned:
- `Esc` - Cancel selection
- `Enter` - Complete selection
- `Ctrl+Z` - Undo last point

## Components

### LassoSelectionTool.tsx
- Main selection canvas interface
- Point drawing and visualization
- Bounding box calculation
- Mask generation

### AreaEditModal.tsx
- Prompt input interface
- Quick suggestion chips
- Character counter
- Processing state management

## Future Enhancements

- [ ] Magic wand tool for automatic object detection
- [ ] Rectangle/Circle selection tools
- [ ] Brush-based selection with adjustable size
- [ ] Selection refinement with edge detection
- [ ] Save and load selections
- [ ] Multiple selection support
- [ ] Undo/redo for selection points

## Troubleshooting

**Issue**: Selection doesn't work
**Solution**: Ensure you have at least 3 points and click "Complete Selection"

**Issue**: AI modifies wrong area
**Solution**: Be more specific in your prompt and ensure your selection is precise

**Issue**: Changes affect entire image
**Solution**: This may happen with vague prompts. Try being more specific about the area and change

**Issue**: Tool doesn't open
**Solution**: Make sure you have uploaded an image first

## Related Features

- **Reference Images**: Upload reference images in the prompt tab to guide AI style
- **Undo/Redo**: Use history controls to revert changes
- **Adjustments**: Fine-tune the result after AI processing
- **Filters**: Apply additional effects to the final image
