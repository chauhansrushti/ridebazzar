@echo off
cd /d "c:\Users\DELL\OneDrive\Desktop\final rb\RideBazzar-Complete"
echo Starting git push...
git add .
echo Files added. Committing...
git commit -m "Add mobile-friendly responsive design - optimized for all devices"
echo Commit done. Pushing to GitHub...
git push origin main
echo Push complete!
pause
