require 'json'
require 'nokogiri'
require 'pry'

doc = Nokogiri::HTML(File.open('records.html'))


records = doc.css('table.engineTable tbody tr').collect do |node|
  data = node.css('td')
  {
    :name => data[0].text,
    :playing_span => data[1].text,
    :matches => data[2].text.to_i,
    :innings_bowled => data[3].text.to_i,
    :balls_bowled => data[4].text.to_i,
    :runs_conceded => data[5].text.to_i,
    :wickets => data[6].text.to_i,
    :best_innings_bowling => data[7].text,
    :best_match_bowling => data[8].text,
    :bowling_average => data[9].text.to_f,
    :economy => data[10].text.to_f,
    :strike_rate => data[11].text.to_f
  }
end

puts JSON.dump(records.sort_by {|d| -d[:wickets] }.first(100))
