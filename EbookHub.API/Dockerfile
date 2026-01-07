# Use the official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ["EbookHub.API.csproj", "./"]
RUN dotnet restore "EbookHub.API.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "EbookHub.API.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "EbookHub.API.dll"]
