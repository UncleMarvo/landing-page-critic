# AI Insights Status Test Guide

## Testing the Applied/Ignored Functionality

### Prerequisites
1. Make sure you have your `OPENAI_API_KEY` set in `.env`
2. Have a website URL analyzed with Lighthouse data
3. Generate some AI insights

### Test Steps

#### 1. Generate AI Insights
1. Enter a website URL in the dashboard
2. Wait for Lighthouse analysis to complete
3. Click "Generate Insights" in the AI-Powered Insights card
4. Verify that insights are displayed with "pending" status

#### 2. Test Applied Status
1. Find an insight with "pending" status
2. Click the "Applied" button
3. Verify:
   - Button shows loading spinner while updating
   - Button becomes disabled during update
   - Status changes from "pending" to "applied"
   - Status icon changes to green checkmark
   - "Applied" metric at the top updates
   - Action buttons disappear
   - Shows "✅ Implemented" message

#### 3. Test Ignored Status
1. Find another insight with "pending" status
2. Click the "Ignore" button
3. Verify:
   - Button shows loading spinner while updating
   - Button becomes disabled during update
   - Status changes from "pending" to "ignored"
   - Status icon changes to red X
   - Action buttons disappear
   - Shows "❌ Dismissed" message

#### 4. Test Metrics Update
1. Check the summary stats at the top of the insights panel
2. Verify that the "Applied" count increases when you mark insights as applied
3. Verify that the count updates in real-time

#### 5. Test Persistence
1. Refresh the page
2. Navigate away and back to the dashboard
3. Verify that the applied/ignored status persists
4. Verify that the metrics still show the correct counts

### Expected Behavior

#### Applied Insights:
- Status: "applied" (green)
- Icon: ✅ CheckCircle
- Action buttons: Hidden
- Message: "✅ Implemented"
- Metrics: Counted in "Applied" total

#### Ignored Insights:
- Status: "ignored" (red)
- Icon: ❌ XCircle
- Action buttons: Hidden
- Message: "❌ Dismissed"
- Metrics: Not counted in "Applied" total

#### Pending Insights:
- Status: "pending" (yellow)
- Icon: ⏰ Clock
- Action buttons: "Applied" and "Ignore" buttons visible
- Metrics: Not counted in "Applied" total

### Troubleshooting

#### Buttons not working:
- Check browser console for errors
- Verify API endpoint is accessible
- Check database connection

#### Status not updating:
- Verify the API call is successful
- Check that the database update worked
- Ensure the page reloads insights after update

#### Metrics not updating:
- Verify that the `loadExistingInsights()` function is called after status update
- Check that the insights are being reloaded from the database
- Ensure the component re-renders with new data
