Add-Type -AssemblyName PresentationCore,PresentationFramework,WindowsBase
$videoPath = 'C:\Users\hp\Downloads\Download.mp4'
$outputPath = 'M:\My Portofolio\.work\reference-video'
$player = [System.Windows.Media.MediaPlayer]::new()
$player.Open([uri]$videoPath)
for ($attempt = 0; $attempt -lt 100 -and -not $player.NaturalDuration.HasTimeSpan; $attempt++) {
  Start-Sleep -Milliseconds 100
}
$duration = $player.NaturalDuration.TimeSpan
"Duration: $duration | $($player.NaturalVideoWidth)x$($player.NaturalVideoHeight)"
$times = @(0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, [Math]::Max(0, $duration.TotalSeconds - 1)) | Sort-Object -Unique
foreach ($second in $times) {
  $player.Position = [TimeSpan]::FromSeconds([Math]::Min($second, $duration.TotalSeconds - 0.1))
  $player.Play()
  Start-Sleep -Milliseconds 700
  $player.Pause()
  $visual = [System.Windows.Media.DrawingVisual]::new()
  $context = $visual.RenderOpen()
  $context.DrawVideo($player, [System.Windows.Rect]::new(0, 0, $player.NaturalVideoWidth, $player.NaturalVideoHeight))
  $context.Close()
  $bitmap = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($player.NaturalVideoWidth, $player.NaturalVideoHeight, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
  $bitmap.Render($visual)
  $encoder = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($bitmap))
  $frameName = Join-Path $outputPath ('time-{0:D2}.png' -f $second)
  $stream = [System.IO.File]::Open($frameName, [System.IO.FileMode]::Create)
  $encoder.Save($stream)
  $stream.Close()
}
$player.Close()
