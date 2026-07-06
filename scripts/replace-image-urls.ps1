# 替换Markdown文件中的图片引用为CDN地址
$baseUrl = "https://cdn.jsdelivr.net/gh/Haagentus/Haagentus.github.io@main"
$mdFiles = Get-ChildItem -Path "E:\Haagentus\Haagentus.github.io\reading\GI-Ebook\books" -Filter "*.md" -Recurse

foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # 替换图片引用
    # 匹配格式: ![alt](images/filename.png)
    $pattern = '!\[([^\]]*)\]\(images/([^)]+)\)'
    $replacement = "![`$1]($baseUrl/reading/GI-Ebook/books/images/`$2)"
    
    $newContent = [regex]::Replace($content, $pattern, $replacement)
    
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Done!"