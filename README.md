# Klaay Frontend developer take-home test

The task is to use this code to create a chat application that uses the provided API.

The goal is to have a friendly UX and UI experience when creating new conversations and writing and reading messages.

We will review your code collaboratively during the technical interview. 
Please send us your code and instructions on running it at least the day before your interview.

## Requirements

- Use the provided API to fetch and send messages.
- Display messages in a chat-like interface.
- Each user can have multiple conversations.
- Each user can only see their conversations.
- Your code must be tested.

## Delivery

- Deliver your code to us at least one day before the interview.
- Note how many hours you have spent on the test.

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

And access it on http://localhost:3000 and the API on http://localhost:3001/docs


## Documentation

- Initial start: 16/03 - 20:30
- end: 16/03 - 22:24

Comments: Since it is CRA setup it kinda has legacy peers to it, when you are going to install Tailwindcss and Shadcn. So other config was needed than what the docs are showing, since they want React with Vite. Also setup a better tsconfig.json file for more typescript rules and a better custom.d.ts to handle different images, icons and svg etc

- 2nd start: 17/03 - 10:30
- 2nd end:  17/03 - 12:50

Comments: UI layout for Landing Hero section and Chat UI layout is now done for mobile and PC with static data with no build prod errors

- 3rf start: 17/03 - 13:30
- 3rd end:  17/03 - 15:05 

Comments: Main requirements are done - Bonus features will come after

- 4th start: 17/03 - 15:00
- 4th end:  17/03 - 17:32 

Comments: 
1. Instead of passing in the browser log a new token, setup login for the hardcoded cred in the server.
2. As well with setting up localstorage, so you dont have to login again with either closing the Chat layour or refreshing the broswer / closing project - Echanced it.
3. Letting a message reply come after you wrote a comment - before it was you needed to refresh state
4. Made more resonses from AI in random order
5. New login component
6. Jest testing which went successfull

## Conclusion: 
1. Add ons - Delete convo, edit convo, saving convos and chat after closing everything down, archived conversations / active conversations 
2. CRA gives a lot of trouble if you want to persist using it while making eveyrthing stick together while working optional

## Time 
I alt med bonus features: Cirka 11 timer

## After Meeting

- 5th start: 18/03 - 13:15
- 5th end:  18/03 - 15:22

Comments: 
1. Added the Polling setInterval with useRef, so we make it for every created conversation.
2. Better Chatlayout UI.
3. Loading spinner until AI response.
4. Made the useState on RevealHero to still show ChatLayout on refresh browser.
5. Made archive onto convo and delete convo (total number as well).
6. Updated jest test and passed all 8 now.

- 6th start: 18/03 - 20:40
- 6th end:  18/03 - 21:36

Comments: 
1. Added code splitting in ChatLayout, with LeftsideBar and RightsideBar. 
2. Added React memo and useCallback for the components to ChatLayout.
3. Made better LeftsideBar UI
4. Added keyboard on click onto add conversation

## Time 
Total with new features after the meeting: 14 hours approx.
