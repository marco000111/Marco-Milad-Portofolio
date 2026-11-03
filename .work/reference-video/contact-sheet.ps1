Add-Type -AssemblyName PresentationCore,PresentationFramework,WindowsBase
$source = 'M:\My Portofolio\.work\reference-video'
$files = Get-ChildItem -LiteralPath $source -Filter 'time-*.png' | Sort-Object Name
$columns = 3
$tileWidth = 320
$imageHeight = 180
$labelHeight = 28
$rows = [Math]::Ceiling($files.Count / $columns)
$visual = [System.Windows.Media.DrawingVisual]::new()
$context = $visual.RenderOpen()
for ($i = 0; $i -lt $files.Count; $i++) {
  $bitmap = [System.Windows.Media.Imaging.BitmapImage]::new([uri]$files[$i].FullName)
  $x = ($i % $columns) * $tileWidth
  $y = [Math]::Floor($i / $columns) * ($imageHeight + $labelHeight)
  $context.DrawImage($bitmap, [System.Windows.Rect]::new($x, $y, $tileWidth, $imageHeight))
  $label = [System.Windows.Media.FormattedText]::new($files[$i].BaseName, [System.Globalization.CultureInfo]::InvariantCulture, [System.Windows.FlowDirection]::LeftToRight, [System.Windows.Media.Typeface]::new('Segoe UI'), 14, [System.Windows.Media.Brushes]::White, 1.0)
  $context.DrawRectangle([System.Windows.Media.Brushes]::Black, $null, [System.Windows.Rect]::new($x, $y + $imageHeight, $tileWidth, $labelHeight))
  $context.DrawText($label, [System.Windows.Point]::new($x + 8, $y + $imageHeight + 4))
}
$context.Close()
$sheet = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($columns * $tileWidth, $rows * ($imageHeight + $labelHeight), 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
$sheet.Render($visual)
$encoder = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
$encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($sheet))
$stream = [System.IO.File]::Open((Join-Path $source 'contact-sheet.png'), [System.IO.FileMode]::Create)
$encoder.Save($stream)
$stream.Close()
