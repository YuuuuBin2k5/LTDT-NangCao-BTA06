# Friend Location Map - Testing Checklist

## Phase 2 Integration Testing

### Map Layer Toggle
- [ ] Layer toggle appears at top-left of map
- [ ] Toggle has 3 options: "Bài viết" / "Bạn bè" / "Cả hai"
- [ ] Selecting "Bài viết" shows only post markers
- [ ] Selecting "Bạn bè" shows only friend markers
- [ ] Selecting "Cả hai" shows both posts and friends
- [ ] Toggle state persists during session
- [ ] Toggle is responsive and smooth

### Privacy Mode Indicator
- [ ] Privacy indicator appears below layer toggle
- [ ] Indicator only shows when friend layer is active
- [ ] Shows correct icon for each mode:
  - [ ] "👥 Tất cả" for ALL_FRIENDS
  - [ ] "⭐ Bạn thân" for CLOSE_FRIENDS
  - [ ] "👻 Ẩn danh" for GHOST_MODE
- [ ] Tapping indicator opens privacy settings modal
- [ ] Indicator updates when privacy mode changes

### Friend Markers
- [ ] Friend markers appear when layer is "Bạn bè" or "Cả hai"
- [ ] Markers show friend avatar
- [ ] Markers show avatar frame if selected
- [ ] Markers show status emoji if set
- [ ] Online status indicator works (green dot)
- [ ] Markers are filtered by viewport (performance)
- [ ] Tapping friend marker opens details bottom sheet
- [ ] Tapping own marker opens status input dialog

### Privacy Settings Modal
- [ ] Modal opens from privacy indicator
- [ ] Shows current privacy mode selected
- [ ] Can change to "Tất cả bạn bè"
- [ ] Can change to "Chỉ bạn thân"
- [ ] Can change to "Chế độ ẩn danh"
- [ ] "Quản lý bạn thân" button appears for CLOSE_FRIENDS mode
- [ ] Close friends manager opens and works
- [ ] Changes apply immediately
- [ ] Toast notification shows on change
- [ ] Modal closes properly

### Status Input Dialog
- [ ] Dialog opens when tapping own marker
- [ ] Can enter custom status text
- [ ] Character counter shows remaining chars (50 max)
- [ ] Shows error when over limit
- [ ] Quick pick emojis are displayed
- [ ] Tapping emoji selects it and fills status
- [ ] Can clear status
- [ ] Save button disabled when invalid
- [ ] Status updates on server
- [ ] Map refreshes to show new status
- [ ] Dialog closes after save
- [ ] Error alert shows if update fails

### Friend Details Bottom Sheet
- [ ] Opens when tapping friend marker (not own)
- [ ] Shows friend avatar with frame
- [ ] Shows friend name and status
- [ ] Shows distance to friend
- [ ] Shows last seen time
- [ ] Interaction buttons work (heart, wave, poke, etc.)
- [ ] "Get Directions" button works
- [ ] Sheet closes properly
- [ ] Interaction animations play

### Avatar Frame Selector (Settings)
- [ ] "Khung avatar" option appears in Settings
- [ ] Modal opens when tapped
- [ ] Shows all available frames in grid
- [ ] Locked frames show lock icon
- [ ] Locked frames show unlock condition
- [ ] Unlocked frames are selectable
- [ ] Selected frame shows checkmark
- [ ] Premium frames show star badge
- [ ] Selection updates immediately
- [ ] Toast notification shows on selection
- [ ] Modal closes properly
- [ ] Selected frame appears on map marker

### Interaction Effects
- [ ] Interaction overlay renders on map
- [ ] Animations play from user to friend
- [ ] Different animations for different interactions
- [ ] Animations complete and clean up
- [ ] Multiple interactions can play simultaneously
- [ ] Effects respect map region/zoom

### Performance
- [ ] Map loads quickly
- [ ] Layer switching is smooth
- [ ] No lag when toggling layers
- [ ] Friend markers render efficiently
- [ ] Viewport filtering works (only visible markers)
- [ ] No memory leaks
- [ ] Smooth scrolling and panning

### Error Handling
- [ ] Graceful handling of network errors
- [ ] Alert shows if status update fails
- [ ] Alert shows if privacy update fails
- [ ] Loading states show appropriately
- [ ] Error states are user-friendly

### Integration with Existing Features
- [ ] Posts still work when layer is "Bài viết" or "Cả hai"
- [ ] Post markers clickable
- [ ] Post carousel works
- [ ] Create post button works
- [ ] Search places button works
- [ ] Location tracking still works
- [ ] Offline sync banner shows
- [ ] No conflicts between posts and friends

### Edge Cases
- [ ] Works with no friends
- [ ] Works with many friends (100+)
- [ ] Works with no posts
- [ ] Works when offline
- [ ] Works when location permission denied
- [ ] Works when not logged in
- [ ] Handles API errors gracefully
- [ ] Handles slow network

### Accessibility
- [ ] All buttons are tappable
- [ ] Touch targets are adequate size
- [ ] Text is readable
- [ ] Contrast is sufficient
- [ ] Modals are dismissible

## Backend Integration Testing

### Status Update Endpoint
- [ ] PUT /api/locations/status accepts status and emoji
- [ ] Status is saved to database
- [ ] Status appears on friend's map
- [ ] Status expires after 4 hours
- [ ] Empty status clears existing status

### Privacy Mode
- [ ] Privacy mode filters friend locations correctly
- [ ] ALL_FRIENDS shows all friends
- [ ] CLOSE_FRIENDS shows only close friends
- [ ] GHOST_MODE hides user from all friends
- [ ] Privacy changes apply immediately

### Avatar Frames
- [ ] GET /api/avatar-frames/all returns all frames
- [ ] Locked/unlocked status is correct
- [ ] PUT /api/avatar-frames/select updates selection
- [ ] Selected frame appears on map marker

## Regression Testing

### Existing Features
- [ ] Login/logout still works
- [ ] Profile editing works
- [ ] Friend requests work
- [ ] Post creation works
- [ ] Post interactions (like, comment) work
- [ ] Place search works
- [ ] Navigation works
- [ ] Settings work

## Notes

- Test on both iOS and Android if possible
- Test on different screen sizes
- Test with different network conditions
- Test with different user roles (new user, power user)
- Document any bugs found
- Take screenshots of issues

## Bug Report Template

```
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Device/Platform:**
[iOS/Android, version]

**Additional Context:**
[Any other relevant information]
```
